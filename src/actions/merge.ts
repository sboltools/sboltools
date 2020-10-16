
import { text, group, spacer, header, indent, conditional } from "../output/output"
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import Context from "../Context"
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

async function graphMerge(ctx:Context,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let [ from ] = namedOpts

    assert(from instanceof OptGraph)

    let toGraph = ctx.getCurrentGraph()
    let fromGraph = (from as OptGraph).getGraph(ctx)

    assert(fromGraph)

    toGraph.addAll(fromGraph)

    return actionResult()
}

