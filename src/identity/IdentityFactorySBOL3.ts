import { Graph, identifyFiletype, node, triple } from "rdfoo";
import Identity from "./Identity";
import ActionResult, { actionResultAbort } from "../actions/ActionResult";
import { text } from "../output/output";
import IdentityFactory, { Existence } from "./IdentityFactory";
import { SBOLVersion } from "../util/get-sbol-version-from-graph";
import joinURIFragments from "../util/join-uri-fragments";
import { SBOL3GraphView, S1Facade, S1DnaComponent, sbol3, S3Component, S3Identified } from "sboljs";
import { Predicates } from "bioterms";
import { strict as assert } from 'assert'
import { identityErrorGeneric, identityErrorUnguessableNamespace, identityErrorChildIdentityMissingContext, identityErrorEmptyChain } from "./helpers/errors";
import { validateDisplayId, validateNamespaceIsPrefix } from "./helpers/validation";
import Chain from "./helpers/Chain";
import { trace } from "../output/print";
import getLastURIFragment from "../util/get-last-uri-fragment";

export default class IdentityFactorySBOL3 extends IdentityFactory {

    from_namespace_and_identity(
        existence:Existence, g:Graph, namespace:string, identity:string, version?:string):Identity
    {
        if (version) {
            throw sbol3VersionError()
        }

        if (Chain.isChain(identity)) {

            // Chain: can be top-level or child

            if(Chain.isEmpty(identity)) {
                throw identityErrorEmptyChain()
            }

            if(Chain.tokens(identity).length === 1) {

                return this.toplevel_from_namespace_displayId(
                    existence, g, namespace, Chain.displayId(identity) as string, undefined)
                
            } else {
                return this.child_from_namespace_context_displayId(
                    existence, g, namespace, Chain.context(identity) as string, Chain.displayId(identity) as string, undefined)
            }

        } else {

            // URI: has to be top-level

            validateNamespaceIsPrefix(namespace, identity)

            let displayId = getLastURIFragment(identity)

            return new Identity(SBOLVersion.SBOL3, namespace, displayId, undefined, undefined, identity)
        }
    }

    from_identity(
        existence:Existence, g:Graph, identity:string, version?:string):Identity
    {
        if (version) {
            throw sbol3VersionError()
        }

        trace(text(`SBOL3 from_identity: identity ${identity}`))

        if (Chain.isChain(identity)) {

            // Chain: can be top-level or child

            // No namespace supplied and identity is a chain
            // Infer the namespace from the graph?

            let prefixes = extractPrefixesFromGraphSBOL3(g)

            if(prefixes.length !== 1) {
                throw identityErrorUnguessableNamespace(prefixes)
            }

            return this.from_namespace_and_identity(existence, g, prefixes[0], identity, undefined)

        } else {

            // URI: has to be top-level

            // No namespace supplied and identity is a URI
            // Invent a namespace from the URI

            let namespace = inventUriPrefixSBOL3(identity)

            return this.from_namespace_and_identity(existence, g, namespace, identity, undefined)
        }
    }

    toplevel_from_displayId(
        existence:Existence, g:Graph, displayId:string, version?:string):Identity
    {
        if (version) {
            throw sbol3VersionError()
        }

        trace(text(`SBOL3 toplevel_from_displayId: displayId ${displayId}`))


        let prefixes = extractPrefixesFromGraphSBOL3(g)

        if(prefixes.length !== 1) {
            throw identityErrorUnguessableNamespace(prefixes)
        }

        return this.toplevel_from_namespace_displayId(existence, g, prefixes[0], displayId, undefined)

    }

    toplevel_from_namespace_displayId(
        existence:Existence, g:Graph, namespace:string, displayId:string, version?:string):Identity
    {

        if (version) {
            throw sbol3VersionError()
        }

        trace(text(`SBOL3 toplevel_from_namespace_displayId: namespace ${namespace}, displayId ${displayId}`))

        return new Identity(SBOLVersion.SBOL3, namespace, displayId, undefined, '', joinURIFragments([namespace, displayId]))
    }

    child_from_namespace_context_displayId(
        existence:Existence, g:Graph, namespace:string, contextIdentity:string, displayId:string, version?:string):Identity
    {
        if (version !== undefined) {
            throw sbol3VersionError()
        }

        let context = this.from_namespace_and_identity(Existence.MustExist, g, namespace, contextIdentity, undefined)
        assert(context.namespace === namespace)

        // base case TL:C = context is a top level
        // recursive case C:C = context is a child

        let parent = sbol3(g).subjectToFacade( node.createUriNode( context.uri))

        assert(parent instanceof S3Identified) 

        let children = parent.ownedObjects as S3Identified[]

        let matches = children.filter((child) => displayIdMatches(child, displayId))

        if(matches.length === 0) {

            // does not exist
            if(existence === Existence.MustExist) {
                throw actionResultAbort(text(`No object with displayId ${displayId} in context ${JSON.stringify(context)}`))
            }

            // TODO ??
            let childUri = parent.subject.value + '/' + displayId

            return new Identity(SBOLVersion.SBOL3, context.namespace, displayId, version, parent.subject.value, childUri)

        } else {

            assert(matches.length === 1)

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`Object with displayId ${displayId} already exists in context ${JSON.stringify(context)}`))
            }
            
            let match = matches[0]

            return new Identity(SBOLVersion.SBOL3, context.namespace, displayId, version, context.uri, match.subject.value)

        }

    }

    child_from_context_displayId(existence:Existence, g: Graph, contextIdentity: string, displayId: string, version?: string): Identity {

        if (version !== undefined) {
            throw sbol3VersionError()
        }

        let context = this.from_identity(Existence.MustExist, g, contextIdentity, undefined)

        let parent = sbol3(g).subjectToFacade(node.createUriNode(context.uri))

        if(!parent) {
            throw actionResultAbort(text(`Context object with identity ${contextIdentity} not found`))
        }

        assert(parent instanceof S3Identified) 

        let matches = parent.ownedObjects.filter((child) => displayIdMatches(child as S3Identified, displayId))

        if(matches.length === 0) {

            // does not exist
            if(existence === Existence.MustExist) {
                throw actionResultAbort(text(`No object with displayId ${displayId} and version ${version} found in context ${JSON.stringify(context)}`))
            }

            let childUri = parent.subject.value + '/' + displayId

            return new Identity(SBOLVersion.SBOL3, context.namespace, displayId, version, parent.subject.value, childUri)

        } else {

            assert(matches.length === 1)

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`Object with displayId ${displayId} and version ${version} already exists in context ${context}`))
            }
            
            let match = matches[0]

            return new Identity(SBOLVersion.SBOL3, context.namespace, displayId, version, context.uri, match.subject.value)

        }
    }
    
}

function sbol3VersionError() {
    return actionResultAbort(text(`Version is only supported in SBOL2`))
}

function extractPrefixesFromGraphSBOL3(g:Graph) {

    let v = new SBOL3GraphView(g)
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

function inventUriPrefixSBOL3(uri:string) {
    let slash = uri.lastIndexOf('/')
    let hash = uri.lastIndexOf('#')
    if(slash !== -1) {
        return uri.slice(0, slash + 1)
    }
    if(hash !== -1) {
        return uri.slice(0, hash + 1)
    }
    return ''
}

function displayIdMatches(obj:S3Identified, displayId:string) {

    if(obj.displayId === displayId)
        return true

    let instanceOf = obj.getProperty(Predicates.SBOL3.instanceOf)

    if(instanceOf) {

        let parentObj = obj.view.subjectToFacade(instanceOf)

        if(parentObj && parentObj.getStringProperty(Predicates.SBOL3.displayId) === displayId) {
            return true
        }
    }

    return false
}
