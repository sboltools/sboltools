import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sbolgraph";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";

export default class OptURL extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }


    getURL(g:Graph):string {
        return this.argv.getString(this.optDef.name, '')
    }

}
