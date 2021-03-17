

import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol3-3to2conversion-001',
        name: 'Convert SBOL3 to SBOL2',
        glob: [
            //'SBOLTestSuite/SBOL3/*.xml',

            //'SBOLTestSuite/SBOL3/BBa_F2620_PoPSReceiver/PoPSReceiver.rdfxml.sbol'

            //'test/data/sbol3/component.xml',
            'test/data/sbol3/interaction.xml'
        ],
        globExclude: [

        ],
        command: (filename) => `
            --trace
            --output sbol2

            graph orig
                import ${filename}

            graph converted
                merge --from orig
                graph-dump --title "Original SBOL3"
                convert --target-sbol-version 2
                graph-dump --title "SBOL3 -> SBOL2"
            
            graph roundtripped
                merge --from converted
                convert --target-sbol-version 3
                graph-dump --title "SBOL3 -> SBOL2 -> SBOL3"
                compare --to orig --ignore ".* .*backport.* .*"
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


