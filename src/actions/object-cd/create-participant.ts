

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



let createParticipantAction:ActionDef = {
    name: 'participant',
    description: 'Shorthand for creating a participation with a participant',
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
            name: 'role',
            type: OptTerm,
            optional: false
        }
    ],
    positionalOpts: [  
    ],
    run: createParticipant
}

export default createParticipantAction

async function createParticipant(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createParticipant'))

    let [ optIdentity, optWithinInteractionIdentity, optRole ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optWithinInteractionIdentity instanceof OptIdentity)
    assert(optRole instanceof OptTerm)


    let withinInteractionIdentity = optWithinInteractionIdentity.getIdentity(ctx, Existence.MayExist)

    // identity of the subcomponent to use as a participant
    let identity = optIdentity.getIdentity(ctx, Existence.MustExist, withinInteractionIdentity)
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



    let role = optRole.getTerm(TermType.ParticipationRole)
    assert(role)



    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createParticipantSBOL2(g, identity, withinInteractionIdentity, role)
        case SBOLVersion.SBOL3:
            return createParticipantSBOL3(g, identity, withinInteractionIdentity, role)
        default:
            throw new ActionResult(text('Unsupported SBOL version for participant action'))
    }

    return new ActionResult()
}

function createParticipantSBOL2(g:Graph, participantIdentity:Identity, withinInteractionIdentity:Identity, role:string):ActionResult {

    let gv = new SBOL2GraphView(g)

    let participationURI = g.generateURI(joinURIFragments([withinInteractionIdentity.uri, 'participation$n$']))
    let participationDisplayId = participationURI.split('/').pop()!

    g.insertProperties(node.createUriNode(participationURI), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.Participation),
        [Predicates.SBOL2.displayId]: node.createStringNode(participationDisplayId),
        [Predicates.SBOL2.role]: node.createUriNode(role),
        [Predicates.SBOL2.participant]: node.createUriNode(participantIdentity.uri)
    })

    g.insertProperties(node.createUriNode(withinInteractionIdentity.uri), {
        [Predicates.SBOL2.participation]: node.createUriNode(participationURI),
    })

    return new ActionResult()
}


function createParticipantSBOL3(g:Graph, participantIdentity:Identity, withinInteractionIdentity:Identity, role:string):ActionResult {

    let gv = new SBOL3GraphView(g)

    let participationURI = g.generateURI(joinURIFragments([withinInteractionIdentity.uri, 'participation$n$']))
    let participationDisplayId = participationURI.split('/').pop()!

    g.insertProperties(node.createUriNode(participationURI), {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Participation),
        [Predicates.SBOL3.displayId]: node.createStringNode(participationDisplayId),
        [Predicates.SBOL3.role]: node.createUriNode(role),
        [Predicates.SBOL3.participant]: node.createUriNode(participantIdentity.uri)
    })

    g.insertProperties(node.createUriNode(withinInteractionIdentity.uri), {
        [Predicates.SBOL3.hasParticipation]: node.createUriNode(participationURI),
    })

    return new ActionResult()

}

