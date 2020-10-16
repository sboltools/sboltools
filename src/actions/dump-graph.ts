
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, serialize } from "rdfoo"
import fetch = require('node-fetch')
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import { trace } from "../output/print"
import { SBOL3GraphView } from "sbolgraph"
import Context from "../Context"
import OptString from "./opt/OptString"

let action:ActionDef = {
    name: 'graph-dump',
    category: 'graphops',
    namedOpts: [
        {
            name: 'title',
            type: OptString,
            optional: true
        }
    ],
    positionalOpts: [
    ],
    run: dumpGraph
}

export default action

async function dumpGraph(ctx:Context,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    let [ titleOpt ] = namedOpts

    let title = 'Graph dump'

    if(titleOpt) {
        title += ': ' + (titleOpt as OptString).getString(g)
    }

    return actionResult(group([
        spacer(),
        header(title),
        spacer(),
        indent([
            text(new SBOL3GraphView(g).serializeXML())
        ])
    ]))

}

