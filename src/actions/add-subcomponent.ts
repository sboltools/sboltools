

import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome, actionResultAbort, actionResultShowHelp, actionResult } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent } from "sboljs"
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"
import { Existence } from "../identity/IdentityFactory"
import Context from "../Context"

let addSubcomponentAction:ActionDef = {
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
    run: addSubcomponent
}

export default addSubcomponentAction

async function addSubcomponent(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    // let [ optIdentity, optWithinComponentIdentity ] = namedOpts

    // assert(optIdentity instanceof OptIdentity)
    // assert(optWithinComponentIdentity instanceof OptIdentity)

    // let identity = optIdentity.getIdentity(g, Existence.MustNotExist)
    // assert(identity !== undefined)

    // if(identity.parentURI) {
    //     throw new ActionResult(text('Components cannot have parents, as they are designated top-level. To specify a component-subcomponent relationship, use the --within-component option.'), Outcome.Abort)
    // }

    // if(identity.sbolVersion === SBOLVersion.SBOL1) {

    //     let gv = new SBOL1GraphView(g)

    //     g.insertProperties(node.createUriNode(identity.uri), {
    //         [Predicates.a]: node.createUriNode(Types.SBOL1.DnaComponent),
    //         [Predicates.SBOL1.displayId]: node.createStringNode(identity.displayId)
    //     })



    //     let withinComponentIdentity = optWithinComponentIdentity.getIdentity(g)

    //     if(withinComponentIdentity !== undefined) {

    //         if(!g.hasMatch(node.createUriNode(withinComponentIdentity.uri), Predicates.a, Types.SBOL1.DnaComponent)) {
    //             throw new ActionResult(text(`DnaComponent with URI ${withinComponentIdentity.uri} not found for --within-component`), Outcome.Abort)
    //         }

    //         let annoURI = g.generateURI(withinComponentIdentity.uri + '_anno$n$')

    //         g.insertProperties(node.createUriNode(withinComponentIdentity.uri), {
    //             [Predicates.SBOL1.annotation]: node.createUriNode(annoURI),
    //         })

    //         g.insertProperties(node.createUriNode(annoURI), {
    //             [Predicates.a]: node.createUriNode(Types.SBOL1.SequenceAnnotation),
    //             [Predicates.SBOL1.subComponent]: node.createUriNode(identity.uri)
    //         })
    //     }

    return actionResult(text(''))

}
