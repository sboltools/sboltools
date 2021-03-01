import { Graph, triple, node } from "rdfoo";
import Identity from "./Identity";
import ActionResult, { actionResultAbort } from "../actions/ActionResult";
import { text } from "../output/output";
import IdentityFactory, { Existence } from "./IdentityFactory";
import { SBOLVersion } from "../util/get-sbol-version-from-graph";
import { identityErrorGeneric, identityErrorEmptyChain, identityErrorUnguessableNamespace } from "./helpers/errors";
import Chain from "./helpers/Chain";
import { validateNamespaceIsPrefix, validateDisplayId } from "./helpers/validation";
import { SBOL2GraphView, sbol2, S2Identified, S2ComponentDefinition, S2ModuleDefinition, S2ComponentInstance, S2SequenceAnnotation } from "sbolgraph";
import { Predicates } from "bioterms";
import joinURIFragments from "../util/join-uri-fragments";
import { match } from "assert";
import { assert } from "console";
import { exists } from "fs";
import { trace } from "../output/print";
import sbol2CompliantConcat from "../util/sbol2-compliant-concat";
import isTopLevelType from "../util/is-toplevel-type";

export default class IdentityFactorySBOL2 extends IdentityFactory {
    from_namespace_and_identity(existence:Existence, g: Graph, namespace: string, identity: string, version?: string | undefined): Identity {

        trace(text(`SBOL2 from_namespace_and_identity: existence ${existence}, namespace ${namespace}, identity ${identity}, version ${version}`))

        if (Chain.isChain(identity)) {

            // Chain: can be top-level or child

            if(Chain.isEmpty(identity)) {
                throw identityErrorEmptyChain()
            }

            if(Chain.tokens(identity).length === 1) {

                return this.toplevel_from_namespace_displayId(
                    existence, g, namespace, Chain.displayId(identity) as string, version)
                
            } else {
                return this.child_from_namespace_context_displayId(
                    existence, g, namespace, Chain.context(identity) as string, Chain.displayId(identity) as string, version)
            }

        } else {

            // URI: has to be top-level

            validateNamespaceIsPrefix(namespace, identity)

            var displayId:string|undefined = undefined


            // If it already exists we can take the displayId from the object

            let existing = sbol2(g).uriToIdentified(identity)
            // TODO: check existing is TL

            if(existing) {

                if(existence === Existence.MustNotExist) {
                    throw actionResultAbort(text(`An object with identity ${identity} in namespace ${namespace} already exists`))
                }
                
                if(version !== undefined && existing.version !== version) {
                    throw actionResultAbort(text(`Supplied version ${version} does not match the version ${existing.version} of existing object ${identity}`))
                }

                if(existing.displayId !== undefined) {
                    displayId = existing.displayId
                }

            } else {

                if(existence === Existence.MustExist) {
                    throw actionResultAbort(text(`An object with identity ${identity} in namespace ${namespace} was not found`))
                }
            }

            if(displayId === undefined) {

                // The namespace has been provided and it is a prefix of our URI
                // However, the object does not exist in our graph, or it does
                // exist but does not have a displayId.
                //
                // Try to extract the displayId, compliant URI style!
                //

                let afterNamespace = identity.slice(namespace.length)

                let tokens = afterNamespace.split(/[\/#]/g)

                if(version !== undefined && tokens[tokens.length - 1] === version) {
                    tokens.pop()
                }
                
                displayId = tokens[tokens.length - 1]
            }


            if(displayId === undefined) {
                throw actionResultAbort(text(`Could not determine displayId for identity ${identity}`))
            }


            return new Identity(SBOLVersion.SBOL2, namespace, displayId, version, undefined, identity)
        }
    }

    from_identity(existence:Existence, g: Graph, identity: string, version?: string | undefined): Identity {

        trace(text(`SBOL2 from_identity: existence ${existence}, identity ${identity}, version ${version}`))

        if (Chain.isChain(identity)) {

            // Chain: can be top-level or child

            // No namespace supplied and identity is a chain
            // Infer the namespace from the graph?

            let prefixes = extractPrefixesFromGraphSBOL2(g)

            if(prefixes.length !== 1) {
                throw identityErrorUnguessableNamespace(prefixes)
            }

            return this.from_namespace_and_identity(existence, g, prefixes[0], identity, version)

        } else {

            // URI: has to be top-level

            // No namespace supplied and identity is a URI

            var namespace:string|undefined = undefined


            let existing = sbol2(g).uriToIdentified(identity)
            // TODO: check existing is TL

            if(existing && (version === undefined || existing.version === version)) {
            
                if(existence === Existence.MustNotExist) {
                    throw actionResultAbort(text(`An object with identity ${identity} already exists`))
                }
                
                namespace = existing.uriPrefix

            } else {

                if(existence === Existence.MustExist) {
                    throw actionResultAbort(text(`An object with identity ${identity} was not found`))
                }
            }


            if(namespace === undefined) {

                // Invent a namespace from the URI

                let persistentIdentity = identity

                if(version !== undefined) {
                    if(identity.endsWith('/' + version) || identity.endsWith('#' + version)) {
                        persistentIdentity = identity.slice(0, identity.length - version.length - 1)
                    }
                }

                // Chop one more token off, making the assumption that it's the displayId

                let slash = persistentIdentity.lastIndexOf('/')
                let hash = persistentIdentity.lastIndexOf('#')

                if(slash === -1 && hash === -1) {
                    throw actionResultAbort(text(`Could not invent namespace for identity ${identity}`))
                }
                
                namespace = persistentIdentity.slice(0, Math.min(slash, hash) - 1)
            }


            if(namespace === undefined) {
                throw actionResultAbort(text(`Could not determine namespace for identity ${identity}`))
            }


            return this.from_namespace_and_identity(existence, g, namespace, identity, version)
        }
    }

    toplevel_from_namespace_displayId(existence:Existence, g: Graph, namespace: string, displayId: string, version?: string | undefined): Identity {

        trace(text(`SBOL2 toplevel_from_namespace_displayId: existence ${existence} namespace ${namespace}, displayId ${displayId}, version ${version}`))

        // It may already exist. Look for objects with that displayId, and check if prefixed with the supplied namespace.
        // TODO: this may not work correctly if there are namespaces prefixed with other namespaces?

        let matches = g.match(null, Predicates.SBOL2.displayId, displayId)
                .map(triple.subjectUri)
                .filter((uri) => uri && uri.indexOf(namespace) === 0)

        if(version !== undefined) {
            matches = matches.filter(uri => g.hasMatch(uri as string, Predicates.SBOL2.version, node.createStringNode(version)))
        }

        matches = matches.filter(uri => {
            let type = triple.objectUri(
                g.matchOne(uri as string, Predicates.a, null)
            )
            return isTopLevelType(type as string)
        })
            
        if(matches.length > 0) {

            // Already exists

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`An object with displayId ${displayId} in namespace ${namespace} already exists`))
            }

            if(matches.length > 1) {
                throw actionResultAbort(text(`More than one object with displayId ${displayId} in namespace ${namespace} found; reference is ambiguous`))
            }

            let uri = matches[0] as string
            assert(typeof uri === 'string')

            return new Identity(SBOLVersion.SBOL2, namespace, displayId, version, undefined, uri)
        } 

        // Does not already exist; mint a compliant URI

        if (existence === Existence.MustExist) {
            throw actionResultAbort(text(`No object with displayId ${displayId} with version ${version} in namespace ${namespace} found`))
        }

        let uri = joinURIFragments(version ? [namespace, displayId, version] : [namespace, displayId])

        return new Identity(SBOLVersion.SBOL2, namespace, displayId, version, undefined, uri)
    }

    toplevel_from_displayId(existence:Existence, g: Graph, displayId: string, version?: string | undefined): Identity {

        trace(text(`SBOL2 toplevel_from_displayId: displayId ${displayId}`))

        // It may already exist. Look for objects with that displayId

        let matches = g.match(null, Predicates.SBOL2.displayId, displayId)
                .map(triple.subjectUri)

        if(version !== undefined) {
            matches = matches.filter(uri => g.hasMatch(uri as string, Predicates.SBOL2.version, node.createStringNode(version)))
        }

        if(matches.length > 0) {

            // Already exists

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`An object with displayId ${displayId} already exists, and no namespace was specified`))
            }

            let uri = matches[0] as string
            assert(typeof uri === 'string')

            return this.from_identity(Existence.MustExist, g, uri, version)
        }

        if(existence === Existence.MustExist) {
            throw actionResultAbort(text(`No object with displayId ${displayId} with version ${version} found`))
        }

        // Does not exist and only have a displayId
        // Infer the namespace from the graph?

        let prefixes = extractPrefixesFromGraphSBOL2(g)

        if(prefixes.length !== 1) {
            throw identityErrorUnguessableNamespace(prefixes)
        }

        return this.toplevel_from_namespace_displayId(existence, g, prefixes[0], displayId, version)
    }

    child_from_namespace_context_displayId(existence:Existence, g: Graph, namespace: string, contextIdentity: string, displayId: string, version?: string | undefined): Identity {

        trace(text(`SBOL2 child_from_namespace_context_displayId: existence ${existence}, namespace ${namespace}, context ${contextIdentity}, displayId ${displayId}`))

        let context = this.from_namespace_and_identity(Existence.MustExist, g, namespace, contextIdentity, undefined)
        assert(context.namespace === namespace)


        let parent = sbol2(g).uriToFacade(context.uri)

        if(!parent) {
            throw actionResultAbort(text(`Context object with identity ${contextIdentity} not found`))
        }

        assert(parent instanceof S2Identified)

        let children: S2Identified[] = []

        if (parent instanceof S2ComponentDefinition
             || parent instanceof S2ModuleDefinition
             || parent instanceof S2ComponentInstance
             || parent instanceof S2SequenceAnnotation
        ) {
            children = children.concat(parent.containedObjects)
        }

        let matches = children.filter((child) => child.getStringProperty(Predicates.SBOL2.displayId) === displayId)

        // also fine to use the definition's identifier
        matches = matches.concat(
            children.filter((child) => {
                let definitionUri = child.getUriProperty(Predicates.SBOL2.definition)
                return definitionUri &&
                    triple.objectString(g.matchOne(definitionUri, Predicates.SBOL2.displayId, null)) === displayId
            })
        )

        if(version !== undefined) {
            matches = matches.filter(match => match.version === version)
        }

        if(matches.length === 0) {

            // does not exist
            if(existence === Existence.MustExist) {
                throw actionResultAbort(text(`No object with displayId ${displayId} and version ${version} found in context ${JSON.stringify(context)}`))
            }

            let childUri = sbol2CompliantConcat(g, parent.uri, displayId)

            return new Identity(SBOLVersion.SBOL2, context.namespace, displayId, version, parent.uri, childUri)

        } else {

            assert(matches.length === 1)

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`Object with displayId ${displayId} and version ${version} already exists in context ${context}`))
            }
            
            let match = matches[0]

            return new Identity(SBOLVersion.SBOL2, context.namespace, displayId, version, context.uri, match.uri)

        }

    }

    child_from_context_displayId(existence:Existence, g: Graph, contextIdentity: string, displayId: string, version?: string | undefined): Identity {

        trace(text(`SBOL2 child_from_context_displayId: context ${contextIdentity}, displayId ${displayId}`))

        let context = this.from_identity(Existence.MustExist, g, contextIdentity, undefined)

        let parent = sbol2(g).uriToFacade(context.uri)

        if(!parent) {
            throw actionResultAbort(text(`Context object with identity ${contextIdentity} not found`))
        }

        assert(parent instanceof S2Identified)

        let children: S2Identified[] = []

        if (parent instanceof S2ComponentDefinition
             || parent instanceof S2ModuleDefinition
             || parent instanceof S2ComponentInstance
             || parent instanceof S2SequenceAnnotation
        ) {
            children = children.concat(parent.containedObjects)
        }

        let matches = children.filter((child) => child.getStringProperty(Predicates.SBOL2.displayId) === displayId)

        // also fine to use the definition's identifier
        matches = matches.concat(
            children.filter((child) => {
                let definitionUri = child.getUriProperty(Predicates.SBOL2.definition)
                return definitionUri &&
                    triple.objectString(g.matchOne(definitionUri, Predicates.SBOL2.displayId, null)) === displayId
            })
        )

        if(version !== undefined) {
            matches = matches.filter(match => match.version === version)
        }

        if(matches.length === 0) {

            // does not exist
            if(existence === Existence.MustExist) {
                throw actionResultAbort(text(`No object with displayId ${displayId} and version ${version} found in context ${JSON.stringify(context)}`))
            }

            let childUri = sbol2CompliantConcat(g, parent.uri, displayId)

            return new Identity(SBOLVersion.SBOL2, context.namespace, displayId, version, parent.uri, childUri)

        } else {

            assert(matches.length === 1)

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`Object with displayId ${displayId} and version ${version} already exists in context ${context}`))
            }
            
            let match = matches[0]

            return new Identity(SBOLVersion.SBOL2, context.namespace, displayId, version, context.uri, match.uri)

        }

    }


}



function extractPrefixesFromGraphSBOL2(g:Graph) {

    let v = new SBOL2GraphView(g)
    let prefixes = new Set<string>()

    for(let t of v.topLevels) {
        let prefix = t.uriPrefix

        if(prefix)
            prefixes.add(prefix)
    }

    let arr = Array.from(prefixes)
    arr.sort((a, b) => a.length - b.length)
    return arr
}


