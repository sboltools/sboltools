
import { Graph, GraphView } from "rdfoo"
import { SBOL1GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol1-create-component-001',
        name: 'Create SBOL1 component',
        command: `
            --trace
            --output sbol1
            create-component --sbol-version 1 --namespace "http://example.com/" --displayId lac_inverter
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL1GraphView(g)

            let matches = gv.dnaComponents.filter(c => {
                return c.uri === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            assert(matches.length === 1)
        }
    },

    {
        id: 'sbol1-create-component-002',
        name: 'Create SBOL1 component with a subcomponent with a sequence',
        command: `
            --trace
            --output sbol1
            create-component --sbol-version 1 --namespace "http://example.com/" --displayId lac_inverter
            create-component --within-component-displayId lac_inverter --displayId pLac
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL1GraphView(g)

            let matches = gv.dnaComponents.filter(c => {
                return c.uri === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            if (matches.length !== 1) {
                throw new Error('matching component not found: ' + matches.length)
            }

            let c = matches[0]

            assert(c.subComponents.length === 1)
            assert(c.subComponents[0].displayId === 'pLac')
        }
    }
]

export default tests


