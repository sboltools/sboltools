

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
import OptTerm, { TermType } from "./opt/OptTerm"
import { Existence } from "../identity/IdentityFactory"
import Identity from "../identity/Identity"
import sbol2CompliantConcat from "../util/sbol2-compliant-concat"
import joinURIFragments from "../util/join-uri-fragments"
import { trace } from "../output/print";
import Context from "../Context"
import IdentityFactorySBOL3 from "src/identity/IdentityFactorySBOL3"

let createComponentAction:ActionDef = {
    name: 'component',
    description: 'Creates a component',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'type',
            type: OptTerm
        },
        {
            name: 'role',
            type: OptTerm
        }
    ],
    positionalOpts: [  
    ],
    run: createComponent
}

export default createComponentAction

async function createComponent(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createComponent'))

    let [ optIdentity, optType, optRole ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optType instanceof OptTerm)
    assert(optRole instanceof OptTerm)


    let identity = optIdentity.getIdentity(ctx, Existence.MustNotExist)
    assert(identity !== undefined)


    let parentURI = ''

    /*
        In order to enable the shorthand for creating subcomponents with their
        components at the same time
        the component creation action operates in two ways:
        - If no parent is specified, we create a component with the identity
        - If a parent is specified, we create two things:
            (1) A Component top-level using only the namespace and displayId of the identity
            (2) A SubComponent with the specified identity 
                 which is an instanceOf the Component
    */
    if(identity.parentURI) {

        parentURI = identity.parentURI

        identity = Identity.toplevel_from_namespace_displayId(
            Existence.MustNotExist, identity.sbolVersion, g, identity.namespace,
                identity.displayId, identity.version)
    }

    trace(text('Create component: identity: ' + identity.uri + ', parent identity: ' + parentURI))


    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL1:
            return createComponentSBOL1(g, identity, optType, optRole, parentURI)
        case SBOLVersion.SBOL2:
            return createComponentSBOL2(g, identity, optType, optRole, parentURI)
        case SBOLVersion.SBOL3:
            return createComponentSBOL3(g, identity, optType, optRole, parentURI)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createComponentSBOL1(g:Graph, identity:Identity, optType:OptTerm, optRole:OptTerm, parentURI:string):ActionResult {

    let gv = new SBOL1GraphView(g)

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL1.DnaComponent),
        [Predicates.SBOL1.displayId]: node.createStringNode(identity.displayId)
    })

    if(parentURI) {

        if(!g.hasMatch(parentURI, Predicates.a, Types.SBOL1.DnaComponent)) {
            throw new ActionResult(text(`Parent DnaComponent with URI ${identity.parentURI} not found`), Outcome.Abort)
        }

        let annoURI = g.generateURI(parentURI + '_anno$n$')

        g.insertProperties(parentURI, {
            [Predicates.SBOL1.annotation]: node.createUriNode(annoURI),
        })

        g.insertProperties(annoURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL1.SequenceAnnotation),
            [Predicates.SBOL1.subComponent]: node.createUriNode(identity.uri)
        })
    }

    return new ActionResult()
}

function createComponentSBOL2(g:Graph, identity:Identity, optType:OptTerm, optRole:OptTerm, parentURI:string):ActionResult {

    let type = optType.getTerm(TermType.Role)

    if(!type) {
        throw new ActionResult(text(`--type parameter is required for component create action`), Outcome.Abort)
    }

    let gv = new SBOL2GraphView(g)

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL2.ComponentDefinition),
        [Predicates.SBOL2.type]: node.createUriNode(type),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId)
    })

    if(identity.version !== undefined) {
        g.insertProperties(identity.uri, {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    if(parentURI) {

        if(!g.hasMatch(parentURI, Predicates.a, Types.SBOL2.ComponentDefinition)) {
            throw new ActionResult(text(`Parent ComponentDefinition with URI ${identity.parentURI} not found`), Outcome.Abort)
        }

        let scURI = g.generateURI(sbol2CompliantConcat(g, parentURI, identity.displayId))

        g.insertProperties(parentURI, {
            [Predicates.SBOL2.component]: node.createUriNode(scURI),
        })

        g.insertProperties(scURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL2.Component),
            [Predicates.SBOL2.definition]: node.createUriNode(identity.uri),
            [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId)
        })
    }

    return new ActionResult()
}


function createComponentSBOL3(g:Graph, identity:Identity, optType:OptTerm, optRole:OptTerm, parentURI:string):ActionResult {

    let type = optType.getTerm(TermType.Role)

    if(!type) {
        throw new ActionResult(text(`--type parameter is required for component create action`), Outcome.Abort)
    }

    let gv = new SBOL3GraphView(g)

    g.insertProperties(identity.uri, {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Component),
        [Predicates.SBOL2.type]: node.createUriNode(type),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId)
    })

    if(parentURI) {

        if(!g.hasMatch(parentURI, Predicates.a, Types.SBOL3.Component)) {
            throw new ActionResult(text(`Parent Component with URI ${identity.parentURI} not found`), Outcome.Abort)
        }

        let scURI = g.generateURI(joinURIFragments([parentURI, 'subcomponent$n$']))
        let scDisplayId = scURI.split('/').pop() || identity.displayId

        g.insertProperties(parentURI, {
            [Predicates.SBOL3.subComponent]: node.createUriNode(scURI),
        })

        g.insertProperties(scURI, {
            [Predicates.a]: node.createUriNode(Types.SBOL3.SubComponent),
            [Predicates.SBOL3.instanceOf]: node.createUriNode(identity.uri),
            [Predicates.SBOL3.displayId]: node.createStringNode(scDisplayId)
        })
    }

    return new ActionResult()
}

