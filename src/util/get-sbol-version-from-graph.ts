
import { Graph, triple } from "rdfoo";
import { Predicates, Prefixes } from 'bioterms'

export enum SBOLVersion {
    SBOL1,
    SBOL2,
    SBOL3,
    Mixed,
    Empty
}

export function getSBOLVersionFromGraph(g:Graph) {

    let version:SBOLVersion = SBOLVersion.Empty

    for(let s of g.subjects) {
        for(let t of g.match(s, Predicates.a, null)) {
            let uri = triple.objectUri(t)

            if(!uri)
                continue

            if(uri.indexOf(Prefixes.sbol1) === 0) {
                if(version !== SBOLVersion.Empty) { 
                    if(version !== SBOLVersion.SBOL1) {
                        return SBOLVersion.Mixed
                    }
                } else {
                    version = SBOLVersion.SBOL1
                }
            } else if(uri.indexOf(Prefixes.sbol2) === 0) {
                if(version !== SBOLVersion.Empty) { 
                    if(version !== SBOLVersion.SBOL2) {
                        return SBOLVersion.Mixed
                    }
                } else {
                    version = SBOLVersion.SBOL2
                }
            } else if(uri.indexOf(Prefixes.sbol3) === 0) {
                if(version !== SBOLVersion.Empty) { 
                    if(version !== SBOLVersion.SBOL3) {
                        return SBOLVersion.Mixed
                    }
                } else {
                    version = SBOLVersion.SBOL3
                }
            }
        }
    }

    return version
}