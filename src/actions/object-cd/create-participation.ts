

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
import OptTerm from "../opt/OptTerm"
import { Existence } from "../../identity/IdentityFactory"
import Identity from "../../identity/Identity"
import sbol2CompliantConcat from "../../util/sbol2-compliant-concat"
import joinURIFragments from "../../util/join-uri-fragments"
import { trace } from "../../output/print";
import Context from "../../Context"
import { TermType } from '../../vocab'


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
        {
            name: '',
            type: OptIdentity,
            optional: true
        }
    ],
    run: createParticipation
}

export default createParticipationAction

async function createParticipation(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createParticipation'))



    let [ optNamedIdentity, optParticipant, optRole ] = namedOpts

    assert(optNamedIdentity instanceof Opt)
    assert(optParticipant instanceof OptIdentity)
    assert(optRole instanceof OptTerm)


    let [ optPositionalIdentity ] = positionalOpts

    assert(!optPositionalIdentity || optPositionalIdentity instanceof OptIdentity)

    let identity = (optPositionalIdentity || optNamedIdentity).getIdentity(ctx, Existence.MustNotExist)
    assert(identity !== undefined)


    if(!identity.parentURI) {
            throw new ActionResult(text('Participation must have a parent'))
    }


    let participantIdentity = optParticipant.getIdentity(ctx, Existence.MustExist)
    assert(participantIdentity)



    let role = optRole.getTerm(TermType.ParticipationRole)
    assert(role)



    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createParticipationSBOL2(g, identity, participantIdentity, role)
        case SBOLVersion.SBOL3:
            return createParticipationSBOL3(g, identity, participantIdentity, role)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createParticipationSBOL2(g:Graph, identity:Identity, participantIdentity:Identity, role:string):ActionResult {

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

    g.insertProperties(node.createUriNode(identity.parentURI!), {
        [Predicates.SBOL2.participation]: node.createUriNode(identity.uri),
    })

    if(participantIdentity) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.participant]: node.createUriNode(participantIdentity.uri)
        })
    }

    return new ActionResult()
}


function createParticipationSBOL3(g:Graph, identity:Identity, participantIdentity:Identity, role:string):ActionResult {

    let gv = new SBOL3GraphView(g)



    let namespace = identity.namespace
    assert(namespace)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Participation),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL3.role]: node.createUriNode(role)
    })

    g.insertProperties(node.createUriNode(identity.parentURI!), {
        [Predicates.SBOL3.hasParticipation]: node.createUriNode(identity.uri),
    })

    if(participantIdentity) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL3.participant]: node.createUriNode(participantIdentity.uri)
        })
    }

    return new ActionResult()
}

