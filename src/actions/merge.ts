
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
import { trace } from "../output/print"

let action:ActionDef = {
    name: 'merge',
    category: 'graphops',
    namedOpts: [
        {
            name: 'from',
            type: OptGraph,
            optional: false
        }
    ],
    positionalOpts: [
    ],
    run: graphMerge
}

export default action

async function graphMerge(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let [ from ] = namedOpts

    assert(from instanceof OptGraph)

    let toGraph = gm.getCurrentGraph()
    let fromGraph = (from as OptGraph).getGraph(gm)

    assert(fromGraph)

    toGraph.addAll(fromGraph)

    return actionResult()
}

