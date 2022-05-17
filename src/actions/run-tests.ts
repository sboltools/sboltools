

import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome, actionResultAbort, actionResultShowHelp, actionResult } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"
import { Existence } from "../identity/IdentityFactory"
import Context from "../Context"

import runTests from '../../test/run-tests'

let runTestsAction:ActionDef = {
    name: 'run-tests',
    description: 'Run tests of sboltools',
    category: 'other',
    namedOpts: [  
    ],
    positionalOpts: [  
    ],
    run: doRunTests
}

export default runTestsAction

async function doRunTests(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    await runTests()

    return actionResult(text(''))

}
