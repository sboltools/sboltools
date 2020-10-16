

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

let createComponentAction:ActionDef = {
    name: 'create-component',
    description: 'Creates a component',
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
        }
    ],
    positionalOpts: [  
    ],
    run: createComponent
}

export default createComponentAction

async function createComponent(ctx:Context, namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createComponent'))

    let [ optIdentity, optWithinComponentIdentity ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optWithinComponentIdentity instanceof OptIdentity)


    trace(text(`Getting withinComponentIdentity`))
    let withinComponentIdentity = optWithinComponentIdentity.getIdentity(ctx, Existence.MustExist)
    trace(text(`Got withinComponentIdentity: ${withinComponentIdentity}`))


    let identity = optIdentity.getIdentity(ctx, Existence.MustNotExist, withinComponentIdentity)
    assert(identity !== undefined)

    if(identity.parentURI) {
        throw new ActionResult(text('Components cannot have parents, as they are designated top-level. To specify a component-subcomponent relationship, use the --within-component option.'), Outcome.Abort)
    }

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL1:
            return createComponentSBOL1(g, identity, withinComponentIdentity)
        case SBOLVersion.SBOL2:
            return createComponentSBOL2(g, identity, withinComponentIdentity)
        case SBOLVersion.SBOL3:
            return createComponentSBOL3(g, identity, withinComponentIdentity)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createComponentSBOL1(g:Graph, identity:Identity, withinComponentIdentity:Identity|undefined):ActionResult {

    let gv = new SBOL1GraphView(g)

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL1.DnaComponent),
        [Predicates.SBOL1.displayId]: node.createStringNode(identity.displayId)
    })

    if(withinComponentIdentity !== undefined) {

        if(!g.hasMatch(withinComponentIdentity.uri, Predicates.a, Types.SBOL1.DnaComponent)) {
            throw new ActionResult(text(`DnaComponent with URI ${withinComponentIdentity.uri} not found for --within-component`), Outcome.Abort)
        }

        let annoURI = g.generateURI(withinComponentIdentity.uri + '_anno$n$')

        g.insertProperties(withinComponentIdentity.uri, {
            [Predicates.SBOL1.annotation]: node.createUriNode(annoURI),
        })

        g.insertProperties(annoURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL1.SequenceAnnotation),
            [Predicates.SBOL1.subComponent]: node.createUriNode(identity.uri)
        })
    }

    return new ActionResult()
}

function createComponentSBOL2(g:Graph, identity:Identity, withinComponentIdentity:Identity|undefined):ActionResult {

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

    if(withinComponentIdentity !== undefined) {

        if(!g.hasMatch(withinComponentIdentity.uri, Predicates.a, Types.SBOL2.ComponentDefinition)) {
            throw new ActionResult(text(`ComponentDefinition with URI ${withinComponentIdentity.uri} not found for --within-component`), Outcome.Abort)
        }

        let scURI = g.generateURI(sbol2CompliantConcat(g, withinComponentIdentity.uri, 'subcomponent$n$'))

        g.insertProperties(withinComponentIdentity.uri, {
            [Predicates.SBOL2.component]: node.createUriNode(scURI),
        })

        g.insertProperties(scURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Component),
            [Predicates.SBOL2.definition]: node.createUriNode(identity.uri),
        })
    }

    return new ActionResult()
}


function createComponentSBOL3(g:Graph, identity:Identity, withinComponentIdentity:Identity|undefined):ActionResult {

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



    if(withinComponentIdentity !== undefined) {

        if(!g.hasMatch(withinComponentIdentity.uri, Predicates.a, Types.SBOL3.Component)) {
            throw new ActionResult(text(`Component with URI ${withinComponentIdentity.uri} not found for --within-component`), Outcome.Abort)
        }

        let scURI = g.generateURI(joinURIFragments([withinComponentIdentity.uri, 'subcomponent$n$']))

        g.insertProperties(withinComponentIdentity.uri, {
            [Predicates.SBOL3.subComponent]: node.createUriNode(scURI),
        })

        g.insertProperties(scURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL3.Component),
            [Predicates.SBOL3.instanceOf]: node.createUriNode(identity.uri),
        })
    }

    return new ActionResult()
}

