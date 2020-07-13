
import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol2-1to2conversion-001',
        name: 'Convert SBOL1 to SBOL2',
        glob: [
             'SBOLTestSuite/SBOL2/*.xml'
        ],
        command: (filename) => `
            --trace
            --output sbol2
            import ${filename}
        `,
        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL2GraphView(g)

            // TODO

        }
    }
]

export default tests


