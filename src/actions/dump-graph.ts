
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, serialize } from "rdfoo"
import fetch = require('node-fetch')
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import { trace } from "../output/print"
import { SBOL3GraphView } from "sbolgraph"
import GraphMap from "../GraphMap"

let action:ActionDef = {
    name: 'graph-dump',
    category: 'graphops',
    namedOpts: [
    ],
    positionalOpts: [
    ],
    run: dumpGraph
}

export default action

async function dumpGraph(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = gm.getCurrentGraph()

    return actionResult(group([
        spacer(),
        header('Graph dump'),
        spacer(),
        indent([
            text(new SBOL3GraphView(g).serializeXML())
        ])
    ]))

}

