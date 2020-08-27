
import { Graph, GraphView } from "rdfoo"
import { SBOL1GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'graphops-dump',
        name: 'Dump the graph',
        command: `
            --trace

            graph a
                insert --subject "http://s" --predicate "http://p" --object "o"
                graph-dump

        `,
        validate: async (r:string|undefined) => {

        }
    },
    {
        id: 'graphops-dump-with-title',
        name: 'Dump the graph with a title',
        command: `
            --trace

            graph a
                insert --subject "http://s" --predicate "http://p" --object "o"
                graph-dump --title "Test title"

        `,
        validate: async (r:string|undefined) => {

        }
    }
]

export default tests
