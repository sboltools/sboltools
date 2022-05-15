

import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sboljs"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol3-2to3conversion-001',
        name: 'Convert SBOL2 to SBOL3',
        glob: [
            //'SBOLTestSuite/SBOL2/*.xml',

	    'tests-extra/SBOL2/m2.xml',

        //     'SBOLTestSuite/SBOL2/memberAnnotations_int_md.xml',
        //     'SBOLTestSuite/SBOL2_ic/gfp_reporter_combDeri_ann.xml',
            // 'SBOLTestSuite/SBOL2/memberAnnotations_interaction.xml',
            // 'SBOLTestSuite/SBOL2/memberAnnotations_md_ann.xml',
            // 'SBOLTestSuite/SBOL2/memberAnnotations_md_mod_ann.xml',
            // 'SBOLTestSuite/SBOL2/memberAnnotations.xml',
            // 'SBOLTestSuite/SBOL2/ModelOutput.xml',
            // 'SBOLTestSuite/SBOL2/ModuleDefinitionOutput_int_md_ann.xml',
        //     'SBOLTestSuite/SBOL2/ModuleDefinitionOutput.xml',
            // 'SBOLTestSuite/SBOL2/multipleCollections_no_Members.xml',
            // 'SBOLTestSuite/SBOL2/partial_pIKE_left_cassette.xml',
            // 'SBOLTestSuite/SBOL2/partial_pIKE_right_casette.xml',
            // 'SBOLTestSuite/SBOL2/partial_pIKE_right_cassette.xml',
            // 'SBOLTestSuite/SBOL2/partial_pTAK_left_cassette.xml',
            // 'SBOLTestSuite/SBOL2/partial_pTAK_right_cassette.xml',
            // 'SBOLTestSuite/SBOL2/pIKE_pTAK_cassettes_2.xml',
            // 'SBOLTestSuite/SBOL2/pIKE_pTAK_cassettes.xml',
            // 'SBOLTestSuite/SBOL2/pIKE_pTAK_left_right_cassettes.xml',
            // 'SBOLTestSuite/SBOL2/pIKE_pTAK_toggle_switches.xml',
            // 'SBOLTestSuite/SBOL2/RepressionModel.xml',
            // 'SBOLTestSuite/SBOL2/SequenceConstraintOutput.xml',
            // 'SBOLTestSuite/SBOL2/singleCollection.xml',
            // 'SBOLTestSuite/SBOL2/singleModel.xml',
            // 'SBOLTestSuite/SBOL2/singleModuleDefinition.xml',
            // 'SBOLTestSuite/SBOL2/test_Experiment_ExperimentData.xml',
            // 'SBOLTestSuite/SBOL2/test_source_location.xml',
            // 'SBOLTestSuite/SBOL2/toggle.xml'
        ],
        globExclude: [

            // Does not *exactly* roundtrip because the prov:wasDerivedFrom property
            // of an SBOL2 SequenceAnnotation becomes a property of an SBOL3 SubComponent
            // in conversion to SBOL3, so when converting back to SBOL3 it becomes a property
            // of the SBOL2 ComponentInstance instead of the SequenceAnnotation.
            //
            'SBOLTestSuite/SBOL2/BBa_I0462.xml'


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
                compare --to orig --ignore ".* .*backport.* .*"
	
	    show-graphs
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


