

import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent, SBOL2GraphView, SBOL3GraphView } from "sbolgraph"
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

let createParticipationAction:ActionDef = {
    name: 'create-participation',
    description: 'Creates a participation',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'within-interaction',
            type: OptIdentity,
            optional: true
        }
    ],
    positionalOpts: [  
    ],
    run: createParticipation
}

export default createParticipationAction

async function createParticipation(ctx:Context, namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createParticipation'))

    let [ optIdentity, optWithinInteractionIdentity ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optWithinInteractionIdentity instanceof OptIdentity)


    
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
        throw new ActionResult(text('Components cannot have parents, as they are designated top-level. To specify a component-subcomponent relationship, use the --within-component option.'), Outcome.Abort)
    }

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createParticipationSBOL2(g, identity, withinInteractionIdentity)
        case SBOLVersion.SBOL3:
            return createParticipationSBOL3(g, identity, withinInteractionIdentity)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createParticipationSBOL2(g:Graph, identity:Identity, withinInteractionIdentity:Identity):ActionResult {

    let gv = new SBOL2GraphView(g)

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL2.ComponentDefinition),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId)
    })

    if(identity.version !== undefined) {
        g.insertProperties(identity.uri, {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    g.insertProperties(withinInteractionIdentity.uri, {
        [Predicates.SBOL2.participation]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}


function createParticipationSBOL3(g:Graph, identity:Identity, withinInteractionIdentity:Identity):ActionResult {

    let gv = new SBOL3GraphView(g)



    let namespace = identity.namespace
    assert(namespace)

    g.insertProperties(namespace, {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Namespace),
        [Predicates.SBOL3.member]: node.createUriNode(identity.uri),
    })

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Component),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId)
    })

    g.insertProperties(withinInteractionIdentity.uri, {
        [Predicates.SBOL2.participation]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}

