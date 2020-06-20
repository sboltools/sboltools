import { Graph, identifyFiletype } from "rdfoo";
import Identity from "./Identity";
import ActionResult, { actionResultAbort } from "../actions/ActionResult";
import { text } from "../output/output";
import IdentityFactory from "./IdentityFactory";
import { SBOLVersion } from "../util/get-sbol-version-from-graph";
import joinURIFragments from "../util/join-uri-fragments";
import { SBOL1GraphView, S1Facade, S1DnaComponent } from "sbolgraph";
import { Predicates } from "bioterms";
import inventUriPrefix from "./helpers/inventURIPrefix";
import { strict as assert } from 'assert'
import { identityErrorGeneric, identityErrorUnguessableNamespace, identityErrorChildIdentityMissingContext, identityErrorEmptyChain } from "./helpers/errors";
import { validateDisplayId, validateNamespaceIsPrefix } from "./helpers/validation";
import Chain from "./helpers/Chain";
import { trace } from "../output/print";

export default class IdentityFactorySBOL1 extends IdentityFactory {

    from_namespace_and_identity(
        g:Graph, namespace:string, identity:string, version?:string):Identity
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
                    g, namespace, Chain.displayId(identity) as string, undefined)
                
            } else {
                return this.child_from_namespace_context_displayId(
                    g, namespace, Chain.context(identity) as string, Chain.displayId(identity) as string, undefined)
            }

        } else {

            // URI: has to be top-level

            validateNamespaceIsPrefix(namespace, identity)

            let displayId = identity.slice(namespace.length)

            return new Identity(SBOLVersion.SBOL1, namespace, displayId, undefined, undefined, identity)
        }
    }

    from_identity(
        g:Graph, identity:string, version?:string):Identity
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

            return this.from_namespace_and_identity(g, prefixes[0], identity, undefined)

        } else {

            // URI: has to be top-level

            // No namespace supplied and identity is a URI
            // Invent a namespace from the URI

            let namespace = inventUriPrefix(identity)

            return this.from_namespace_and_identity(g, namespace, identity, undefined)
        }
    }

    toplevel_from_displayId(
        g:Graph, displayId:string, version?:string):Identity
    {
        trace(text(`SBOL1 toplevel_from_displayId: displayId ${displayId}, version ${version}`))

        if (version) {
            throw sbol1VersionError()
        }

        let prefixes = extractPrefixesFromGraphSBOL1(g)

        if(prefixes.length !== 1) {
            throw identityErrorUnguessableNamespace(prefixes)
        }

        return this.toplevel_from_namespace_displayId(g, prefixes[0], displayId, undefined)

    }

    toplevel_from_namespace_displayId(
        g:Graph, namespace:string, displayId:string, version?:string):Identity
    {
        trace(text(`SBOL1 toplevel_from_namespace_displayId: namespace ${namespace}, displayId ${displayId}, version ${version}`))

        if (version) {
            throw sbol1VersionError()
        }

        return new Identity(SBOLVersion.SBOL1, namespace, displayId, undefined, '', joinURIFragments([namespace, displayId]))
    }

    child_from_namespace_context_displayId(
        g:Graph, namespace:string, context:string, displayId:string, version?:string):Identity
    {
        return this._child_from_context_displayId_optional_namespace(g, namespace, context, displayId, version)

    }

    child_from_context_displayId(g: Graph, context: string, displayId: string, version?: string): Identity {

        return this._child_from_context_displayId_optional_namespace(g, undefined, context, displayId, version)
    }
    
    private _child_from_context_displayId_optional_namespace(
        g:Graph, namespace:string|undefined, context:string, displayId:string, version?:string):Identity
    {
        if (version !== undefined) {
            throw sbol1VersionError()
        }

        if(!Chain.isChain(context)) {

            // Context is a URI

            if(namespace === undefined) {
                namespace = inventUriPrefix(context) 
            } else {
                validateNamespaceIsPrefix(namespace, context)
            }

            return new Identity(SBOLVersion.SBOL1, namespace, displayId, undefined, context, joinURIFragments([namespace, displayId]))
        }

        // Need to traverse the graph to find the parent URI.

        let contextDisplayIds = Chain.tokens(context)

        let v = new SBOL1GraphView(g)

        let parent: S1Facade | undefined = undefined

        for (let n = 0; n < contextDisplayIds.length; ++n) {

            let contextDisplayId = contextDisplayIds[n]

            if (parent) {
                let children: S1Facade[] = []
                if (parent instanceof S1DnaComponent) {
                    children = children.concat(parent.annotations)
                    children = children.concat(parent.subComponents)
                }
                parent = children.filter(tl => tl.getStringProperty(Predicates.SBOL1.displayId) === contextDisplayId)[0]

            } else {
                let matchingTopLevels = v.topLevels.filter(tl => tl.getStringProperty(Predicates.SBOL1.displayId) === contextDisplayId)

                if(matchingTopLevels.length === 0) {
                    throw actionResultAbort(text('no top level found with displayId ' + displayId))
                }

                if(namespace !== undefined) {
                    matchingTopLevels = matchingTopLevels.filter(tl => {
                        return tl.uri.indexOf(namespace as string) === 0
                    })
                }

                if(matchingTopLevels.length > 1) {
                    throw actionResultAbort(text('more than one possible match for displayId ' + displayId))
                }

                parent = matchingTopLevels[0]
            }

            if (!parent) {
                throw actionResultAbort(text('displayId not found: ' + displayId))
            }
        }

        if (parent === undefined) {
            throw new Error('???')
        }

        let ns = namespace || inventUriPrefix(parent.uri)

        return this.child_from_namespace_context_displayId(g, ns, parent.uri, displayId, undefined)
    }

}

function sbol1VersionError() {
    return actionResultAbort(text(`Version is only supported in SBOL2`))
}

export function extractPrefixesFromGraphSBOL1(g:Graph) {

    let subjects = g.subjects
    let prefixes = new Set<string>()

    for(let s of subjects) {
        let prefix = inventUriPrefix(s)

        if(prefix)
            prefixes.add(prefix)
    }

    let arr = Array.from(prefixes)
    arr.sort((a, b) => a.length - b.length)
    return arr
}
