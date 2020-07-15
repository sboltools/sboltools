
import { text, group, spacer, header, indent, conditional } from "../output/output"
import ActionResult, { actionResult } from "./ActionResult"

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
    let diffs:OutputNode[] = []

    for(let triple of fromGraph.toArray()) {
        if(!toGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            diffs.push(text('Triple ' + JSON.stringify(triple) + ' is in current graph but not in comparison graph'))
        }
    }

    for(let triple of toGraph.toArray()) {
        if(!fromGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            diffs.push(text('Triple ' + JSON.stringify(triple) + ' is in comparison graph but not in current graph'))
        }
    }

    if(equal) {
        diffs.push(text('Graphs were equal'))
    } else {
        diffs.push(text('Graphs were not equal'))
    }

    return actionResult()
}

