
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph } from "rdfoo"
import { SBOLConverter } from "sbolgraph"
import ActionResult from "./ActionResult"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import Opt from "./opt/Opt"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"


let convertAction:ActionDef = {
    name: 'convert',
    category: 'local-conversion',
    opts: [
        {
            name: 'target',
            type: OptSBOLVersion,
            refinements: {
                infer: false
            }
        }
    ],
    run: convert
}

export default convertAction

async function convert(g:Graph, opts:Opt[]):Promise<ActionResult> {

    let [ target ] = opts

    assert(target instanceof OptSBOLVersion)

    let sbolVersion = target.getSBOLVersion(g)

    if(sbolVersion === SBOLVersion.SBOL1) {

        return new ActionResult(true, text('Conversion to SBOL1 is not yet implemented; please use the online validator via vc-convert'))

    } else if(sbolVersion === SBOLVersion.SBOL2) {

        await SBOLConverter.convert1to2(g)
        await SBOLConverter.convert3to2(g)

    } else if(sbolVersion === SBOLVersion.SBOL3) {

        await SBOLConverter.convert1to2(g)
        await SBOLConverter.convert2to3(g)

    } else {

        return new ActionResult(true, text('convert: target must be one of sbol1, sbol2, sbol3'))
    }

    return new ActionResult(false, group([]))
}
