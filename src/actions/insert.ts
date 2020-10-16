
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
import { node } from 'rdfoo'

let action:ActionDef = {
    name: 'insert',
    category: 'graphops',
    namedOpts: [
        {
            name: 'subject',
            type: OptString,
            optional: false
        },
        {
            name: 'predicate',
            type: OptString,
            optional: false
        },
        {
            name: 'object',
            type: OptString,
            optional: false
        }
    ],
    positionalOpts: [
    ],
    run: graphInsert
}

export default action

async function graphInsert(ctx:Context,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let [ subject, predicate, object ] = namedOpts

    let g = ctx.getCurrentGraph()

    // TODO

    g.insertProperties((subject as OptString).getString(g), {
        [(predicate as OptString).getString(g)]: node.createStringNode((object as OptString).getString(g))
    })

    return actionResult()
}
