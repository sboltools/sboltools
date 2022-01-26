
import { text, group, spacer, header, indent, conditional, tabulated } from "../output/output"
import { Graph, serialize } from "rdfoo"
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import { trace } from "../output/print"
import { SBOL3GraphView } from "sbolgraph"
import Context from "../Context"
import OptString from "./opt/OptString"

let action:ActionDef = {
    name: 'show-graphs',
    category: 'graphops',
    namedOpts: [
    ],
    positionalOpts: [
    ],
    run: showGraphs
}

export default action

async function showGraphs(ctx:Context,  namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    let title = 'Graphs (' + ctx.graphs.size + ')'

    return actionResult(group([
        spacer(),
        header(title),
        spacer(),
        indent([
		tabulated(
			Array.from(ctx.graphs.keys()).map(k => {
				return [k, ctx.graphs.get(k)!.toArray().length.toString()]
			})
		)
		])
    ]))

}

