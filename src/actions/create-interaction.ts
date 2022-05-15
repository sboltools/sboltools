

import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent, SBOL2GraphView, SBOL3GraphView } from "sboljs"
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
import OptTerm, { TermType } from "./opt/OptTerm"

let createInteractionAction:ActionDef = {
    name: 'interaction',
    description: 'Creates an interaction',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'within-component',
            type: OptIdentity,
            optional: true
        },
        {
            name: 'type',
            type: OptTerm,
            optional: false
        }
    ],
    positionalOpts: [  
    ],
    run: createInteraction
}

export default createInteractionAction

async function createInteraction(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createInteraction'))

    let [ optIdentity, optWithinComponentIdentity, optRole ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optWithinComponentIdentity instanceof OptIdentity)
    assert(optRole instanceof OptTerm)


    
    let withinComponentIdentity = optWithinComponentIdentity.getIdentity(ctx, Existence.MayExist)

    let identity = optIdentity.getIdentity(ctx, Existence.MustNotExist, withinComponentIdentity)
    assert(identity !== undefined)

    if(!withinComponentIdentity) {
        if(identity.parentURI) {
                withinComponentIdentity = Identity.from_namespace_and_identity(
                Existence.MustExist, identity.sbolVersion, g, identity.namespace, identity.parentURI, identity.version)
        }
    }
  
    assert(withinComponentIdentity !== undefined)

    if(!withinComponentIdentity) {
        throw new ActionResult(text('Components cannot have parents, as they are designated top-level. To specify a component-subcomponent relationship, use the --within-component option.'), Outcome.Abort)
    }

    let role = optRole.getTerm(TermType.InteractionType)
    assert(role)

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createInteractionSBOL2(g, identity, withinComponentIdentity, role)
        case SBOLVersion.SBOL3:
            return createInteractionSBOL3(g, identity, withinComponentIdentity, role)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createInteractionSBOL2(g:Graph, identity:Identity, withinComponentIdentity:Identity, type:string):ActionResult {

    let gv = new SBOL2GraphView(g)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.Interaction),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL2.type]: node.createUriNode(type)
    })

    if(identity.version !== undefined) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    g.insertProperties(node.createUriNode(withinComponentIdentity.uri), {
        [Predicates.SBOL2.interaction]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}


function createInteractionSBOL3(g:Graph, identity:Identity, withinComponentIdentity:Identity, type:string):ActionResult {

    let gv = new SBOL3GraphView(g)



    let namespace = identity.namespace
    assert(namespace)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Interaction),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId)
    })

    g.insertProperties(node.createUriNode(withinComponentIdentity.uri), {
        [Predicates.SBOL3.hasInteraction]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}

