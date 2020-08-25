
import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol2-1to2conversion-001',
        name: 'Convert SBOL1 to SBOL2',
        glob: [
            'SBOLTestSuite/SBOL1/*.xml'
            // 'SBOLTestSuite/SBOL1/labhost_All.xml'
        ],
        command: (filename) => `
            --trace
            --output sbol2

            graph orig
                import ${filename}

            graph converted
                merge --from orig
                graph-dump
                convert --target-sbol-version 2
                graph-dump
                validate
            
            graph roundtripped
                merge --from converted
                convert --target-sbol-version 1
                graph-dump
                validate
                compare --to orig
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


