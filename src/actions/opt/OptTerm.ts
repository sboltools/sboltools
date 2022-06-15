import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sboljs";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";
import { termShorthandToUri, TermType } from "src/vocab";


export default class OptTerm extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }

    getTerm(type:TermType):string|undefined {
        let name = this.argv.getString(this.optDef.name, '')
        if(!name) {
            return undefined
        }
        return termShorthandToUri(type, name)
    }

}
