

import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView, SBOL2GraphView, SBOL3GraphView } from "sbolgraph"
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"
import { Existence } from "../identity/IdentityFactory"
import Identity from "../identity/Identity"
import sbol2CompliantConcat from "../util/sbol2-compliant-concat"
import joinURIFragments from "../util/join-uri-fragments"
import { trace } from "../output/print";
import Context from "../Context"

let createModuleAction:ActionDef = {
    name: 'create-module',
    description: 'Creates a module (SBOL2 only)',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'within-module',
            type: OptIdentity,
            optional: true
        }
    ],
    positionalOpts: [  
    ],
    run: createModule
}

export default createModuleAction

async function createModule(ctx:Context, namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createModule'))

    let [ optIdentity, optWithinModuleIdentity ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optWithinModuleIdentity instanceof OptIdentity)


    trace(text(`Getting withinModuleIdentity`))
    let withinModuleIdentity = optWithinModuleIdentity.getIdentity(ctx, Existence.MustExist)
    trace(text(`Got withinModuleIdentity: ${withinModuleIdentity}`))


    let identity = optIdentity.getIdentity(ctx, Existence.MustNotExist, withinModuleIdentity)
    assert(identity !== undefined)

    if(identity.parentURI) {
        throw new ActionResult(text('Modules cannot have parents, as they are designated top-level. To specify a module-submodule relationship, use the --within-module option.'), Outcome.Abort)
    }

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createModuleSBOL2(g, identity, withinModuleIdentity)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-module'))
    }

    return new ActionResult()
}


function createModuleSBOL2(g:Graph, identity:Identity, withinModuleIdentity:Identity|undefined):ActionResult {

    let gv = new SBOL2GraphView(g)

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL2.ModuleDefinition),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId)
    })

    if(identity.version !== undefined) {
        g.insertProperties(identity.uri, {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    if(withinModuleIdentity !== undefined) {

        if(!g.hasMatch(withinModuleIdentity.uri, Predicates.a, Types.SBOL2.ModuleDefinition)) {
            throw new ActionResult(text(`ModuleDefinition with URI ${withinModuleIdentity.uri} not found for --within-Module`), Outcome.Abort)
        }

        let scURI = g.generateURI(sbol2CompliantConcat(g, withinModuleIdentity.uri, 'subModule$n$'))

        g.insertProperties(withinModuleIdentity.uri, {
            [Predicates.SBOL2.module]: node.createUriNode(scURI),
        })

        g.insertProperties(scURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Module),
            [Predicates.SBOL2.definition]: node.createUriNode(identity.uri),
        })
    }

    return new ActionResult()
}



