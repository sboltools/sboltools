import assert = require("assert")
import { S2Identified, SBOL2GraphView, Graph } from "sbolgraph"
import joinURIFragments from "./join-uri-fragments"

export default function sbol2CompliantConcat(g:Graph, uri:string, childDisplayId:string):string {

    assert(uri)

    let gv = new SBOL2GraphView(g)
    let identified = new S2Identified(gv, uri)

    // does it have a persistentIdentity? if so concat to that

    let pId = identified.persistentIdentity
    let version = identified.version

    if(pId) {
        return joinURIFragments([ pId, childDisplayId, version ])
    }

    // no = not compliant (or does not exist yet? TODO is this actually getting
    // used for stuff that doesn't exist?)

    return joinURIFragments([uri, childDisplayId])

}
