

import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol3-2to3conversion-001',
        name: 'Convert SBOL2 to SBOL3',
        glob: [
            'SBOLTestSuite/SBOL2/*.xml'
            // 'SBOLTestSuite/SBOL2/AnnotationOutput.xml'
        ],
        globExclude: [
        ],
        command: (filename) => `
            --trace
            --output sbol3

            graph orig
                import ${filename}

            graph converted
                merge --from orig
                graph-dump --title "Original SBOL2"
                convert --target-sbol-version 3
                graph-dump --title "SBOL2 -> SBOL3"
            
            graph roundtripped
                merge --from converted
                convert --target-sbol-version 2
                graph-dump --title "SBOL2 -> SBOL3 -> SBOL2"
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


