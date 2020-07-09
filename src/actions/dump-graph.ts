
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, serialize } from "rdfoo"
import fetch = require('node-fetch')
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import { trace } from "../output/print"
import { SBOL3GraphView } from "sbolgraph"

let action:ActionDef = {
    name: 'dump-graph',
    category: 'other',
    namedOpts: [
    ],
    positionalOpts: [
    ],
    run: dumpGraph
}

export default action

async function dumpGraph(g:Graph,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    trace(group([
        header('Graph dump'),
        spacer(),
        indent([
            text(new SBOL3GraphView(g).serializeXML())
        ])
    ]))

    return actionResult()

}

