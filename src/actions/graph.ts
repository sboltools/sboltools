
import { text, group, spacer, header, indent, conditional } from "../output/output"
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import Context from "../Context"
import OptString from "./opt/OptString"
import assert = require("assert")

let action:ActionDef = {
    name: 'graph',
    category: 'graphops',
    namedOpts: [
    ],
    positionalOpts: [
        {
            name: 'graph_name',
            type: OptString,
            optional: true
        }
    ],
    run: graph
}

export default action

async function graph(ctx:Context,  namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    if(positionalOpts.length !== 1) {
        throw new ActionResult(text('graph action needs exactly one parameter: the name of the graph to switch to'))
    }

    let graphNameOpt = positionalOpts[0]
    assert(graphNameOpt instanceof OptString)

    let graphName = graphNameOpt.getString(ctx.getCurrentGraph())

    ctx.setCurrentGraph(graphName)

    return actionResult()

}

