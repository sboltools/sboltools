import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sbolgraph";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";
import GraphMap from "../../GraphMap";

export default class OptGraphName extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }


    getGraph(gm:GraphMap):Graph|undefined {
        let s = this.argv.getString(this.optDef.name, '')
        let g = gm.getGraph(s)
        return g
    }

}
