
import { Graph, GraphView } from "rdfoo"
import { SBOL1GraphView } from "sbolgraph"
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

            assert(g.hasMatch('http://s', 'http://p', 'o'))
            assert(!g.hasMatch('http://s', 'http://p', 'o2'))
            assert(g.toArray().length === 1)
        }
    }
]

export default tests
