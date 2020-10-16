
import { Graph, GraphView } from "rdfoo"
import { SBOL2GraphView } from "sbolgraph"
import Test from "../Test"
import { strict as assert } from 'assert'

let tests:Test[] = [
    {
        id: 'sbol2-crispr-001',
        name: 'CRISPR example',
        command: `
            --trace
            --output sbol2
            namespace "http://example.com/"
            sbol-version 2
            create-component .cas9_generic
            create-component .gRNA_generic
            create-component .cas9_gRNA_complex
            create-component .target_gene
            create-component .target
            create-module .CRISPR_Template
            create-interaction .CRISPR_Template.cas9_complex_formation --role NonCovalentBinding
                create-participation .CRISPR_Template.cas9_complex_formation.cas9_generic --component .cas9_generic --role Reactant
                create-participation .CRISPR_Template.cas9_complex_formation.gRNA_generic --component .gRNA_generic --role Reactant
                create-participation .CRISPR_Template.cas9_complex_formation.cas9_gRNA_complex --component .gRNA_gRNA_complex --role Product
            create-interaction .CRISPR_Template.target_production --role GeneticProduction
                create-participation .CRISPR_Template.target_production.participant_target_gene --component .target_gene --role Promoter
                create-participation .CRISPR_Template.target_production.participant_target --component .target --role Product
            create-interaction .CRISPR_Template.target_gene_inhibition --role Inhibition
                create-participation .CRISPR_Template.target_gene_inhibition.participant_cas9_gRNA_complex --component .cas9_gRNA_complex --role Inhibitor
                create-participation .CRISPR_Template.target_gene_inhibition.participant_target_gene --component .target_gene --role Promoter
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


