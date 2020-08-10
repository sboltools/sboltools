
import { text, group, spacer, header, indent, conditional, tabulated } from "../output/output"
import ActionResult, { actionResult, actionResultAbort } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import GraphMap from "../GraphMap"
import OptString from "./opt/OptString"
import OptGraph from "./opt/OptGraph"
import { strict as assert } from 'assert'
import OutputNode from "../output/OutputNode"

let action:ActionDef = {
    name: 'compare',
    category: 'graphops',
    namedOpts: [
        {
            name: 'to',
            type: OptGraph,
            optional: false
        }
    ],
    positionalOpts: [
    ],
    run: graphCompare
}

export default action

async function graphCompare(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let [ to ] = namedOpts

    assert(to instanceof OptGraph)

    let fromGraph = gm.getCurrentGraph()
    let toGraph = (to as OptGraph).getGraph(gm)

    assert(toGraph)

    let equal = true
    let inFromOnly:string[][] = []
    let inToOnly:string[][] = []

    for(let triple of fromGraph.toArray()) {
        if(!toGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            inFromOnly.push([triple.subject.nominalValue, triple.predicate.nominalValue, triple.object.nominalValue])
        }
    }

    for(let triple of toGraph.toArray()) {
        if(!fromGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            inToOnly.push([triple.subject.nominalValue, triple.predicate.nominalValue, triple.object.nominalValue])
        }
    }

    let out:OutputNode[] = []

    if(equal) {
        out.push(text('Graphs were equal'))
        return actionResult(group(out))
    } else {
        out.push(text('Graphs were not equal'))
        out.push(spacer())


        if(inFromOnly.length > 0) {
            out.push(spacer())
            out.push(text('In current graph but not comparison graph:'))
            out.push(indent([
                tabulated(inFromOnly)
            ]))
        }


        if(inToOnly.length > 0) {
            out.push(spacer())
            out.push(text('In comparison graph but not current graph:'))
            out.push(indent([
                tabulated(inToOnly)
            ]))
        }

        return actionResultAbort(group(out))
    }

}

