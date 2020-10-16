
import { text, group, spacer, header, indent, conditional } from "../output/output"
import ActionResult, { actionResult } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import Context from "../Context"
import OptString from "./opt/OptString"
import { SBOLVersion } from "../util/get-sbol-version-from-graph"

let action:ActionDef = {
    name: 'sbol-version',
    category: 'graphops',
    namedOpts: [
    ],
    positionalOpts: [
        {
            name: 'sbol-version',
            type: OptString,
            optional: false
        }
    ],
    run: sbolVersion,
    help: `
Sets the default SBOL version 1/2/3 for actions which create SBOL objects. This namespace can be overridden per-action with --sbol-version.
`
}

export default action

async function sbolVersion(ctx:Context,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    if(positionalOpts.length !== 1) {
        throw new ActionResult(text('sbol-version action needs exactly one parameter: an SBOL version 1/2/3'))
    }

    let version = positionalOpts[0]

    if(version === '1') {
        ctx.sbolVersion = SBOLVersion.SBOL1
    } else if(version === '2') {
        ctx.sbolVersion = SBOLVersion.SBOL2
    } else if(version === '3') {
        ctx.sbolVersion = SBOLVersion.SBOL3
    } else {
        throw new ActionResult(text('unknown SBOL version: ' + version))
    }

    return actionResult()

}

