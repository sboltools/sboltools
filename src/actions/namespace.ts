
import { text, group, spacer, header, indent, conditional } from "../output/output"
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import Context from "../Context"
import OptString from "./opt/OptString"

let action:ActionDef = {
    name: 'namespace',
    category: 'graphops',
    namedOpts: [
    ],
    positionalOpts: [
        {
            name: 'uri',
            type: OptString,
            optional: false
        }
    ],
    run: namespace,
    help: `
Sets the default namespace for actions which accept an identity parameter. This namespace can be overridden per-action with --identity.
`
}

export default action

async function namespace(ctx:Context,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    if(positionalOpts.length !== 1) {
        throw new ActionResult(text('namespace action needs exactly one parameter: the URI of a namespace to set as current'))
    }

    let ns = positionalOpts[0]

    ctx.currentNamespace = ns

    return actionResult()

}

