


import { text, group, spacer, header, indent, conditional } from "../../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent, SBOL2GraphView, SBOL3GraphView } from "sboljs"
import OptIdentity from "../opt/OptIdentity"
import { Predicates, Prefixes, Types } from "bioterms"
import { Existence } from "../../identity/IdentityFactory"
import Identity from "../../identity/Identity"
import { trace } from "../../output/print";
import Context from "../../Context"
import OptTerm  from "../opt/OptTerm"
import {TermType} from '../../vocab'

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
            name: 'type',
            type: OptTerm,
            optional: false
        }
    ],
    positionalOpts: [  
        {
            name: '',
            type: OptIdentity,
            optional: true
        }
    ],
    run: createInteraction
}

export default createInteractionAction

async function createInteraction(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createInteraction'))
    


    let [ optNamedIdentity, optType ] = namedOpts

    assert(optNamedIdentity instanceof Opt)
    assert(optType instanceof OptTerm)


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


    if(!parentURI) {
            throw new ActionResult(text('Interaction must have a parent'))
    }


    let _type = optType.getTerm(TermType.InteractionType)
    assert(_type)

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createInteractionSBOL2(g, identity, parentURI, _type)
        case SBOLVersion.SBOL3:
            return createInteractionSBOL3(g, identity, parentURI, _type)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createInteractionSBOL2(g:Graph, identity:Identity, parentURI:string, _type:string):ActionResult {

    let gv = new SBOL2GraphView(g)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.Interaction),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL2.type]: node.createUriNode(_type)
    })

    if(identity.version !== undefined) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    g.insertProperties(node.createUriNode(parentURI), {
        [Predicates.SBOL2.interaction]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}


function createInteractionSBOL3(g:Graph, identity:Identity, parentURI:string, _type:string):ActionResult {

    let gv = new SBOL3GraphView(g)

    let namespace = identity.namespace
    assert(namespace)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Interaction),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId)
    })

    g.insertProperties(node.createUriNode(parentURI), {
        [Predicates.SBOL3.hasInteraction]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}

