import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sbolgraph";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";

export default class OptSBOLVersion extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }

    getSBOLVersion(g:Graph):SBOLVersion {
        let paramPrefix = this.optDef.name !== '' ? this.optDef.name + '-' : ''
        let sbolversion = this.argv.getString(paramPrefix + 'sbol-version', '')
        let infer = this.optDef.refinements.infer !== false

        if(sbolversion === '1') {
            return SBOLVersion.SBOL1
        } else if(sbolversion === '2') {
            return SBOLVersion.SBOL2
        } else if(sbolversion === '3') {
            return SBOLVersion.SBOL3
        } else {
            if(!infer) {
                throw new ActionResult(true, text(`Please specify --${paramPrefix}sbol-version 1/2/3`))
            }
            let consensus = getConsensusSBOLVersion(g)
    
            if(consensus === ConsensusVersion.SBOL1)
                return SBOLVersion.SBOL1
            else if(consensus === ConsensusVersion.SBOL2)
                return SBOLVersion.SBOL2
            else if(consensus === ConsensusVersion.SBOL3)
                return SBOLVersion.SBOL3
            else {
                throw new ActionResult(true, text(`Could not infer input SBOL version from current graph (does it contain mixed SBOL versions?); please specify  --${paramPrefix}sbol-version 1/2/3`))
            }
        }
    }

}
