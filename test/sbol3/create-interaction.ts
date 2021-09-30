
import { Graph, GraphView } from "rdfoo"
import { SBOL3GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol3-create-interaction-001',
        name: 'Create SBOL3 component with an interaction',
        command: `
            --trace
            --output sbol3
            namespace "http://example.com/"
            sbol-version 3
            component --type DNA .lac_inverter
            component --type DNA .lac_inverter.pLac
            component --type Protein .lac_inverter.lacI
            interaction --type Inhibition .lac_inverter.lacI_represses_pLac 
                participant .lac_inverter.lacI --role Inhibitor
                participant .lac_inverter.pLac --role Promoter
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL3GraphView(g)

            let matches = gv.components.filter(c => {
                return c.subject.value === 'http://example.com/lac_inverter' &&
                    c.displayId === 'lac_inverter'
            })

            if (matches.length !== 1) {
                throw new Error('matching component not found: ' + matches.length)
            }

            let c = matches[0]

            assert(c.subComponents.length === 2)
            assert(c.subComponents[0].instanceOf.displayId === 'pLac')
            assert(c.subComponents[0].displayId === c.subComponents[0].subject.value.split('/').pop())
            assert(c.subComponents[1].instanceOf.displayId === 'lacI')
            assert(c.subComponents[1].displayId === c.subComponents[1].subject.value.split('/').pop())
        }
    }
]

export default tests


