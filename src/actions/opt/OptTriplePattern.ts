import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sboljs";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";

export default class OptTriplePattern extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }

    getPattern():{s:RegExp, p:RegExp, o:RegExp}|undefined {
        let pattern = this.argv.getString(this.optDef.name, '')

	if(!pattern)
		return undefined

        let spo = pattern.split(/\s+/)

        return {
            s: new RegExp(spo[0]),
            p: new RegExp(spo[1]),
            o: new RegExp(spo[2])
        }
    }

}
