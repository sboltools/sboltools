
import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sboljs"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol2-create-component-001',
        name: 'Create SBOL2 component',
        command: `
            --trace
            --output sbol
            sbol-version 2
            namespace "http://example.com/"
            component lac_inverter
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL2GraphView(g)

            let matches = gv.componentDefinitions.filter(c => {
                return c.subject.value === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            assert(matches.length === 1)
        }
    },

    {
        id: 'sbol2-create-component-002',
        name: 'Create SBOL2 component with a subcomponent',
        command: `
            --trace
            --output sbol
            sbol-version 2
            namespace "http://example.com/"
            component lac_inverter
            component lac_inverter.pLac
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL2GraphView(g)

            let matches = gv.componentDefinitions.filter(c => {
                return c.subject.value === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            if (matches.length !== 1) {
                throw new Error('matching component not found: ' + matches.length)
            }

            let c = matches[0]

            assert(c.components.length === 1)
            assert(c.components[0].definition.displayId === 'pLac')
        }
    }
]

export default tests


