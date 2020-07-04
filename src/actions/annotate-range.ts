
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView } from "sbolgraph"
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"
import Opt1BasedInt from "./opt/Opt1BasedInt"
import { Existence } from "../identity/IdentityFactory"

let annotateRangeAction:ActionDef = {
    name: 'annotate-range',
    description: 'Annotates a range in a sequence',
    category: 'seq-anno',
    namedOpts: [
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'in-component',
            type: OptIdentity
        },
        {
            name: 'start',
            type: Opt1BasedInt
        },
        {
            name: 'end',
            type: Opt1BasedInt
        },
        {
            name: 'role',
            type: Opt1BasedInt
        }
    ],
    positionalOpts: [
    ],
    run: annotateRange,
    help: `
`
}

export default annotateRangeAction

async function annotateRange(g: Graph, namedOpts: Opt[], positionalOpts: string[]): Promise<ActionResult> {

    let [ optIdentity, optInComponentIdentity, optSource, optEncoding ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optInComponentIdentity instanceof OptIdentity)
    assert(optSource instanceof OptURL)
    assert(optEncoding instanceof OptString)

    let identity = optIdentity.getIdentity(g, Existence.MustExist)
    assert(identity !== undefined)

    if(identity.sbolVersion === SBOLVersion.SBOL1) {
        throw new ActionResult(text('SBOL1 does not support sequence annotations without subcomponents.  Instead, create and assign a subcomponent using the create-component and add-subcomponent actions.'), Outcome.Abort)
    }

    return new ActionResult()
}
