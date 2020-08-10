
import { Graph, GraphView } from "rdfoo"
import { SBOL1GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'graphops-switch-graph-1',
        name: 'Switch from one graph to another (test 1)',
        command: `
            --trace
            --output sbol3

            graph a
                insert --subject "http://s" --predicate "http://p" --object "o"

            graph b
                insert --subject "http://s" --predicate "http://p" --object "o2"

            graph a
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)

            assert(g.hasMatch('http://s', 'http://p', 'o'))
            assert(!g.hasMatch('http://s', 'http://p', 'o2'))
            assert(g.toArray().length === 1)
        }
    },
    {
        id: 'graphops-switch-graph-2',
        name: 'Switch from one graph to another (test 2)',
        command: `
            --trace
            --output sbol3

            graph a
                insert --subject "http://s" --predicate "http://p" --object "o"

            graph b
                insert --subject "http://s" --predicate "http://p" --object "o2"
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)

            assert(g.hasMatch('http://s', 'http://p', 'o2'))
            assert(!g.hasMatch('http://s', 'http://p', 'o'))
            assert(g.toArray().length === 1)
        }
    }
]

export default tests
