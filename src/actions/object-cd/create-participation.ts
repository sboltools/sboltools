

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
import OptTerm, { TermType } from "../opt/OptTerm"
import { Existence } from "../../identity/IdentityFactory"
import Identity from "../../identity/Identity"
import sbol2CompliantConcat from "../../util/sbol2-compliant-concat"
import joinURIFragments from "../../util/join-uri-fragments"
import { trace } from "../../output/print";
import Context from "../../Context"


let createParticipationAction:ActionDef = {
    name: 'participation',
    description: 'Creates a participation',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'within-interaction', /// TODO: are these withins necessary or is parent of identity enough?
            type: OptIdentity,
            optional: true
        },
        {
            name: 'participant',
            type: OptIdentity,
            optional: true
        },
        {
            name: 'role',
            type: OptTerm,
            optional: false
        }
    ],
    positionalOpts: [  
    ],
    run: createParticipation
}

export default createParticipationAction

async function createParticipation(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createParticipation'))

    let [ optIdentity, optWithinInteractionIdentity, optParticipant, optRole ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optWithinInteractionIdentity instanceof OptIdentity)
    assert(optParticipant instanceof OptIdentity)
    assert(optRole instanceof OptTerm)


    trace(text(`createParticipation participant ${JSON.stringify(optParticipant.optDef)}`))
    
    let withinInteractionIdentity = optWithinInteractionIdentity.getIdentity(ctx, Existence.MayExist)

    let identity = optIdentity.getIdentity(ctx, Existence.MustNotExist, withinInteractionIdentity)
    assert(identity !== undefined)

    if(!withinInteractionIdentity) {
        if(identity.parentURI) {
            withinInteractionIdentity = Identity.from_namespace_and_identity(
                Existence.MustExist, identity.sbolVersion, g, identity.namespace, identity.parentURI, identity.version)
        }
    }
  
    assert(withinInteractionIdentity !== undefined)

    if(!withinInteractionIdentity) {
        throw new ActionResult(text('Participation must be contained by an interaction'))
    }



    let participantIdentity = optParticipant.getIdentity(ctx, Existence.MustExist, withinInteractionIdentity)
    assert(participantIdentity)



    let role = optRole.getTerm(TermType.ParticipationRole)
    assert(role)



    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createParticipationSBOL2(g, identity, withinInteractionIdentity, participantIdentity, role)
        case SBOLVersion.SBOL3:
            return createParticipationSBOL3(g, identity, withinInteractionIdentity, participantIdentity, role)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createParticipationSBOL2(g:Graph, identity:Identity, withinInteractionIdentity:Identity, participantIdentity:Identity, role:string):ActionResult {

    let gv = new SBOL2GraphView(g)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.Participation),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL2.role]: node.createUriNode(role)
    })

    if(identity.version !== undefined) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    g.insertProperties(node.createUriNode(withinInteractionIdentity.uri), {
        [Predicates.SBOL2.participation]: node.createUriNode(identity.uri),
    })

    if(participantIdentity) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.participant]: node.createUriNode(participantIdentity.uri)
        })
    }

    return new ActionResult()
}


function createParticipationSBOL3(g:Graph, identity:Identity, withinInteractionIdentity:Identity, participantIdentity:Identity, role:string):ActionResult {

    let gv = new SBOL3GraphView(g)



    let namespace = identity.namespace
    assert(namespace)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Participation),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL3.role]: node.createUriNode(role)
    })

    g.insertProperties(node.createUriNode(withinInteractionIdentity.uri), {
        [Predicates.SBOL3.hasParticipation]: node.createUriNode(identity.uri),
    })

    if(participantIdentity) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL3.participant]: node.createUriNode(participantIdentity.uri)
        })
    }

    return new ActionResult()
}

