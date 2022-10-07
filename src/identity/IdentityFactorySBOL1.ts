import { Graph, identifyFiletype, node } from "rdfoo";
import Identity from "./Identity";
import ActionResult, { actionResultAbort } from "../actions/ActionResult";
import { text } from "../output/output";
import IdentityFactory, { Existence } from "./IdentityFactory";
import { SBOLVersion } from "../util/get-sbol-version-from-graph";
import joinURIFragments from "../util/join-uri-fragments";
import { SBOL1GraphView, S1Facade, S1DnaComponent, sbol1 } from "sboljs";
import { Predicates } from "bioterms";
import { strict as assert } from 'assert'
import { identityErrorGeneric, identityErrorUnguessableNamespace, identityErrorChildIdentityMissingContext, identityErrorEmptyChain } from "./helpers/errors";
import { validateDisplayId, validateNamespaceIsPrefix } from "./helpers/validation";
import Chain from "./helpers/Chain";
import { trace } from "../output/print";

export default class IdentityFactorySBOL1 extends IdentityFactory {

    from_namespace_and_identity(
        existence:Existence, g:Graph, namespace:string, identity:string, version?:string):Identity
    {
        if (version) {
            throw sbol1VersionError()
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

            let displayId = identity.slice(namespace.length)

            return new Identity(SBOLVersion.SBOL1, namespace, displayId, undefined, undefined, identity)
        }
    }

    from_identity(
        existence:Existence, g:Graph, identity:string, version?:string):Identity
    {
        trace(text(`SBOL1 from_identity: identity ${identity}, version ${version}`))

        if (version) {
            throw sbol1VersionError()
        }

        if (Chain.isChain(identity)) {

            // Chain: can be top-level or child

            // No namespace supplied and identity is a chain
            // Infer the namespace from the graph?

            let prefixes = extractPrefixesFromGraphSBOL1(g)

            if(prefixes.length !== 1) {
                throw identityErrorUnguessableNamespace(prefixes)
            }

            return this.from_namespace_and_identity(existence, g, prefixes[0], identity, undefined)

        } else {

            // URI: has to be top-level

            // No namespace supplied and identity is a URI
            // Invent a namespace from the URI

            let namespace = inventUriPrefixSBOL1(identity)

            return this.from_namespace_and_identity(existence, g, namespace, identity, undefined)
        }
    }

    toplevel_from_displayId(
        existence:Existence, g:Graph, displayId:string, version?:string):Identity
    {
        trace(text(`SBOL1 toplevel_from_displayId: displayId ${displayId}, version ${version}`))

        if (version) {
            throw sbol1VersionError()
        }

        let prefixes = extractPrefixesFromGraphSBOL1(g)

        if(prefixes.length !== 1) {
            throw identityErrorUnguessableNamespace(prefixes)
        }

        return this.toplevel_from_namespace_displayId(existence, g, prefixes[0], displayId, undefined)

    }

    toplevel_from_namespace_displayId(
        existence:Existence, g:Graph, namespace:string, displayId:string, version?:string):Identity
    {
        trace(text(`SBOL1 toplevel_from_namespace_displayId: namespace ${namespace}, displayId ${displayId}, version ${version}`))

        if (version) {
            throw sbol1VersionError()
        }

        return new Identity(SBOLVersion.SBOL1, namespace, displayId, undefined, '', joinURIFragments([namespace, displayId]))
    }

    child_from_namespace_context_displayId(
        existence:Existence, g:Graph, namespace:string, contextIdentity:string, displayId:string, version?:string):Identity
    {
        trace(text(`SBOL1 child_from_namespace_context_displayId: existence ${existence}, namespace ${namespace}, contextIdentity ${contextIdentity}, displayId ${displayId}, version ${version}`))

        if (version !== undefined) {
            throw sbol1VersionError()
        }

        let context = this.from_namespace_and_identity(Existence.MustExist, g, namespace, contextIdentity, undefined)
        assert(context.namespace === namespace)

        // base case TL:C = context is a top level
        // recursive case C:C = context is a child

        let parent = sbol1(g).subjectToFacade(node.createUriNode(context.uri))

        let children: S1Facade[] = []
        if (parent instanceof S1DnaComponent) {
            children = children.concat(parent.annotations)
            children = children.concat(parent.subComponents)
        }

        let match = children.filter((child) => child.getStringProperty(Predicates.SBOL1.displayId) === displayId)[0]

        if(match) {

            if(existence === Existence.MustNotExist) {
                throw actionResultAbort(text(`Child with displayId ${displayId} already exists in context ${contextIdentity}`))
            }

            // TODO: does supplied version match object?
            return this.from_namespace_and_identity(existence, g, namespace, match.subject.value, version)

        } else {

            if(existence === Existence.MustExist) {
                throw actionResultAbort(text(`No child found with displayId ${displayId} in context ${contextIdentity}`))
            }

            let childUri = joinURIFragments([ parent!.subject.value, displayId ])

            return new Identity(SBOLVersion.SBOL1, context.namespace, displayId, version, context.uri, childUri)

        }


    }

    child_from_context_displayId(existence:Existence, g: Graph, contextIdentity: string, displayId: string, version?: string): Identity {

        if (version !== undefined) {
            throw sbol1VersionError()
        }

        let context = this.from_identity(Existence.MustExist, g, contextIdentity, undefined)

        let parent = sbol1(g).subjectToFacade(node.createUriNode(context.uri))

        if(!parent) {
            throw actionResultAbort(text(`Context object with identity ${contextIdentity} not found`))
        }

        let children: S1Facade[] = []
        if (parent instanceof S1DnaComponent) {
            children = children.concat(parent.annotations)
            children = children.concat(parent.subComponents)
        }

        let match = children.filter((child) => child.getStringProperty(Predicates.SBOL1.displayId) === displayId)[0]

        return this.from_namespace_and_identity(existence, g, context.namespace, match.subject.value, version)
    }
    
}

function sbol1VersionError() {
    return actionResultAbort(text(`Version is only supported in SBOL2`))
}

function extractPrefixesFromGraphSBOL1(g:Graph) {

    let v = new SBOL1GraphView(g)
    let topLevels = v.topLevels
    let prefixes = new Set<string>()

    for(let t of topLevels) {
        let prefix = inventUriPrefixSBOL1(t.subject.value)

        if(prefix)
            prefixes.add(prefix)
    }

    let arr = Array.from(prefixes)
    arr.sort((a, b) => a.length - b.length)
    return arr
}

function inventUriPrefixSBOL1(uri:string) {
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

