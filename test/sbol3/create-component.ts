
import { Graph, GraphView } from "rdfoo"
import { SBOL3GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol3-001',
        name: 'Create SBOL3 component',
        command: `
            --trace
            --output sbol1
            create-component --sbol-version 3 --namespace "http://example.com/" --displayId lac_inverter
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL3GraphView(g)

            let matches = gv.components.filter(c => {
                return c.uri === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            assert(matches.length === 1)
        }
    },

    {
        id: 'sbol3-002',
        name: 'Create SBOL3 component with a subcomponent with a sequence',
        command: `
            --trace
            --output sbol1
            create-component --sbol-version 3 --namespace "http://example.com/" --displayId lac_inverter
            dump-graph
            create-component --within-component-displayId lac_inverter --displayId pLac
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL3GraphView(g)

            let matches = gv.components.filter(c => {
                return c.uri === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            if (matches.length !== 1) {
                throw new Error('matching component not found: ' + matches.length)
            }

            let c = matches[0]

            assert(c.subComponents.length === 1)
            assert(c.subComponents[0].instanceOf.displayId === 'pLac')
        }
    }
]

export default tests


