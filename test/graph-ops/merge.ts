
import { Graph, GraphView, node } from "rdfoo"
import { SBOL1GraphView } from "sboljs"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'graphops-merge',
        name: 'Merge one graph into another',
        command: `
            --trace
            --output sbol3

            graph a
                insert --subject "http://s" --predicate "http://p" --object "o"

            graph b
                merge --from a
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)

            assert(g.hasMatch(node.createUriNode('http://s'), 'http://p', node.createStringNode('o')))
            assert(!g.hasMatch(node.createUriNode('http://s'), 'http://p', node.createStringNode('o2')))
            assert(g.toArray().length === 1)
        }
    }
]

export default tests
