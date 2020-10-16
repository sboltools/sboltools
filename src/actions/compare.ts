
import { text, group, spacer, header, indent, conditional, tabulated } from "../output/output"
import ActionResult, { actionResult, actionResultAbort } from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import Context from "../Context"
import OptString from "./opt/OptString"
import OptGraph from "./opt/OptGraph"
import { strict as assert } from 'assert'
import OutputNode from "../output/OutputNode"
import { subjectUri } from "rdfoo/dist/rdfoo/triple"
import { Predicates } from "bioterms"
import { triple } from "rdfoo"

let action:ActionDef = {
    name: 'compare',
    category: 'graphops',
    namedOpts: [
        {
            name: 'to',
            type: OptGraph,
            optional: false
        }
    ],
    positionalOpts: [
    ],
    run: graphCompare
}

export default action

async function graphCompare(ctx:Context,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let [ to ] = namedOpts

    assert(to instanceof OptGraph)

    let fromGraph = ctx.getCurrentGraph()
    let toGraph = (to as OptGraph).getGraph(ctx)

    assert(toGraph)

    let equal = true
    let inFromOnly:string[][] = []
    let inToOnly:string[][] = []

    let subjects:Set<string> = new Set()

    for(let triple of fromGraph.toArray()) {
        if(!toGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            inFromOnly.push([triple.subject.nominalValue, triple.predicate.nominalValue, triple.object.nominalValue])

            subjects.add(triple.subject.nominalValue)
            subjects.add(triple.object.nominalValue)
        }
    }

    for(let triple of toGraph.toArray()) {
        if(!fromGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            inToOnly.push([triple.subject.nominalValue, triple.predicate.nominalValue, triple.object.nominalValue])

            subjects.add(triple.subject.nominalValue)
            subjects.add(triple.object.nominalValue)
        }
    }



    let typesInFrom:string[][] = []
    let typesInTo:string[][] = []

    for(let subject of subjects) {
        let type = triple.objectUri(fromGraph.match(subject, Predicates.a, null)[0])

        if(type)
            typesInFrom.push([ subject, 'a', type ])
    }

    for(let subject of subjects) {
        let type = triple.objectUri(toGraph.match(subject, Predicates.a, null)[0])

        if(type)
            typesInTo.push([ subject, 'a', type ])
    }

    let out:OutputNode[] = []

    if(equal) {
        out.push(text('compare: Graphs were equal'))
        return actionResult(group(out))
    } else {
        out.push(text('compare: Graphs were not equal'))
        out.push(spacer())


        if(inFromOnly.length > 0) {
            out.push(spacer())
            out.push(text('In current graph but not comparison graph:'))
            out.push(indent([
                tabulated(inFromOnly)
            ]))
        }


        if(inToOnly.length > 0) {
            out.push(spacer())
            out.push(text('In comparison graph but not current graph:'))
            out.push(indent([
                tabulated(inToOnly)
            ]))
        }



        if(typesInFrom.length > 0) {
            out.push(spacer())
            out.push(text('Types in current graph:'))
            out.push(indent([
                tabulated(typesInFrom)
            ]))
        }

        if(typesInTo.length > 0) {
            out.push(spacer())
            out.push(text('Types in comparison graph:'))
            out.push(indent([
                tabulated(typesInTo)
            ]))
        }

        return actionResultAbort(group(out))
    }

}

