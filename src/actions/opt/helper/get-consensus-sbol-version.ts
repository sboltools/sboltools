import { SBOLVersion } from "../../../util/get-sbol-version-from-graph"
import ActionResult from "../../ActionResult"
import { Graph, node, triple } from "sbolgraph"
import { text } from "../../../output/output"
import { Predicates, Prefixes } from "bioterms"

export enum ConsensusVersion {
    SBOL1,
    SBOL2,
    SBOL3,
    Mixed,
    Empty
}

export function getConsensusSBOLVersion(g:Graph) {

    let version:ConsensusVersion = ConsensusVersion.Empty

    for(let s of g.subjects) {
        for(let t of g.match(node.createUriNode(s), Predicates.a, null)) {
            let uri = triple.objectUri(t)

            if(!uri)
                continue

            if(uri.indexOf(Prefixes.sbol1) === 0) {
                if(version !== ConsensusVersion.Empty) { 
                    if(version !== ConsensusVersion.SBOL1) {
                        return ConsensusVersion.Mixed
                    }
                } else {
                    version = ConsensusVersion.SBOL1
                }
            } else if(uri.indexOf(Prefixes.sbol2) === 0) {
                if(version !== ConsensusVersion.Empty) { 
                    if(version !== ConsensusVersion.SBOL2) {
                        return ConsensusVersion.Mixed
                    }
                } else {
                    version = ConsensusVersion.SBOL2
                }
            } else if(uri.indexOf(Prefixes.sbol3) === 0) {
                if(version !== ConsensusVersion.Empty) { 
                    if(version !== ConsensusVersion.SBOL3) {
                        return ConsensusVersion.Mixed
                    }
                } else {
                    version = ConsensusVersion.SBOL3
                }
            }
        }
    }

    return version
}
