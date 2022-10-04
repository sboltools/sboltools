

import { text, group, spacer, header, indent, conditional } from "../../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent, SBOL2GraphView, SBOL3GraphView } from "sboljs"
import OptIdentity from "../opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptTerm  from "../opt/OptTerm"
import { Existence } from "../../identity/IdentityFactory"
import Identity from "../../identity/Identity"
import sbol2CompliantConcat from "../../util/sbol2-compliant-concat"
import joinURIFragments from "../../util/join-uri-fragments"
import { trace } from "../../output/print";
import Context from "../../Context"

let createModuleAction:ActionDef = {
    name: 'module',
    description: 'Creates a module (SBOL2 only)',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        }
    ],
    positionalOpts: [  
        {
            name: '',
            type: OptIdentity,
            optional: true
        }
    ],
    run: createModule
}

export default createModuleAction

async function createModule(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createModule'))

    let [ optNamedIdentity ] = namedOpts

    assert(optNamedIdentity instanceof Opt)


    let [ optPositionalIdentity ] = positionalOpts

    assert(!optPositionalIdentity || optPositionalIdentity instanceof OptIdentity)

    let identity = (optPositionalIdentity || optNamedIdentity).getIdentity(ctx, Existence.MustNotExist)
    assert(identity !== undefined)



    let parentURI = ''

    if(identity.parentURI) {

        parentURI = identity.parentURI

        identity = Identity.toplevel_from_namespace_displayId(
            Existence.MustNotExist, identity.sbolVersion, g, identity.namespace,
                identity.displayId, identity.version)
    }

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createModuleSBOL2(g, identity, parentURI)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-module'))
    }

    return new ActionResult()
}


function createModuleSBOL2(g:Graph, identity:Identity, parentURI:string) {

    let gv = new SBOL2GraphView(g)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.ModuleDefinition),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId)
    })

    if(identity.version !== undefined) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    if(parentURI) {

        if(!g.hasMatch(node.createUriNode(parentURI), Predicates.a, node.createUriNode(Types.SBOL2.ModuleDefinition))) {
            throw new ActionResult(text(`Parent ModuleDefinition with URI ${parentURI} not found`), Outcome.Abort)
        }

        let scURI = g.generateURI(sbol2CompliantConcat(g, parentURI, 'subModule$n$'))

        g.insertProperties(node.createUriNode(parentURI), {
            [Predicates.SBOL2.module]: node.createUriNode(scURI),
        })

        g.insertProperties(node.createUriNode(scURI), {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Module),
            [Predicates.SBOL2.definition]: node.createUriNode(identity.uri),
            [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId)
        })
    }

    return new ActionResult()
}



