
import { text, group, spacer, header, indent, conditional } from "../output/output"
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import GraphMap from "../GraphMap"
import OptString from "./opt/OptString"

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

async function graph(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    if(positionalOpts.length !== 1) {
        throw new ActionResult(text('graph action needs exactly one parameter: the name of the graph to switch to'))
    }

    let graphName = positionalOpts[0]

    gm.setCurrentGraph(graphName)

    return actionResult()

}

