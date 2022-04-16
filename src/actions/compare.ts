
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
import { node, triple } from "rdfoo"
import OptTriplePattern from "./opt/OptTriplePattern"
import { trace } from "../output/print"

let action:ActionDef = {
    name: 'compare',
    category: 'graphops',
    namedOpts: [
        {
            name: 'to',
            type: OptGraph,
            optional: false
        },
        {
            name: 'ignore',
            type: OptTriplePattern,
            optional: true
        }
    ],
    positionalOpts: [
    ],
    run: graphCompare
}

export default action

async function graphCompare(ctx:Context,  namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let [ to, ignore ] = namedOpts

    assert(to instanceof OptGraph)
    assert(ignore instanceof OptTriplePattern)

    let ignorePattern = ignore.getPattern()
    

    let fromGraph = ctx.getCurrentGraph()
    let toGraph = (to as OptGraph).getGraph(ctx)

    let fromGraphName = Array.from(ctx.graphs.entries()).filter(e => e[1] === fromGraph)[0][0]
    let toGraphName = Array.from(ctx.graphs.entries()).filter(e => e[1] === toGraph)[0][0]

    trace(text('fromGraph (' + fromGraphName + ') has size ' + fromGraph.toArray().length))
    trace(text('toGraph (' + toGraphName + ') has size ' + toGraph!.toArray().length))

    assert(toGraph)

    let equal = true
    let inFromOnly:string[][] = []
    let inToOnly:string[][] = []

    let subjects:Set<string> = new Set()

    for(let triple of fromGraph.toArray()) {
        if(ignorePattern) {
            if(ignorePattern.s.test(triple.subject.value) &&
              ignorePattern.p.test(triple.predicate.value) &&
              ignorePattern.o.test(triple.object.value))  {
                continue
            }
        }
        if(!toGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            inFromOnly.push([
                triple.subject.value, 
                triple.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
                    ? 'a' : triple.predicate.value,
                triple.object.value
            ])

            subjects.add(triple.subject.value)
            subjects.add(triple.object.value)
        }
    }

    for(let triple of toGraph.toArray()) {
        if(ignorePattern) {
            if(ignorePattern.s.test(triple.subject.value) &&
              ignorePattern.p.test(triple.predicate.value) &&
              ignorePattern.o.test(triple.object.value))  {
                continue
            }
        }
        if(!fromGraph.hasMatch(triple.subject, triple.predicate, triple.object)) {
            equal = false
            inToOnly.push([
                triple.subject.value,
                triple.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
                    ? 'a' : triple.predicate.value,
                triple.object.value
            ])

            subjects.add(triple.subject.value)
            subjects.add(triple.object.value)
        }
    }



    let typesInFrom:string[][] = []
    let typesInTo:string[][] = []

    for(let subject of subjects) {
        let type = triple.objectUri(fromGraph.match(node.createUriNode(subject), Predicates.a, null)[0])

        if(type)
            typesInFrom.push([ subject, 'a', type ])
    }

    for(let subject of subjects) {
        let type = triple.objectUri(toGraph.match(node.createUriNode(subject), Predicates.a, null)[0])

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
            out.push(text('In current graph (' + fromGraphName + ') but not comparison graph (' + toGraphName + '):'))
            out.push(indent([
                tabulated(inFromOnly)
            ]))
        }


        if(inToOnly.length > 0) {
            out.push(spacer())
            out.push(text('In comparison graph (' + toGraphName + ') but not current graph (' + fromGraphName + '):'))
            out.push(indent([
                tabulated(inToOnly)
            ]))
        }



        /*
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
        }*/

        return actionResultAbort(group(out))
    }

}

