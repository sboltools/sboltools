
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
            component .cas9_generic --type Protein
            component .gRNA_generic --type RNA --role SO:0001998
            component .cas9_gRNA_complex --type Complex
            component .target_gene --type DNA --role Promoter
            component .target --type Protein
            module .CRISPR_Template
                interaction .CRISPR_Template.cas9_complex_formation --type NonCovalentBinding
                    participation .CRISPR_Template.cas9_complex_formation.cas9_generic --participant .cas9_generic --role Reactant
                    participation .CRISPR_Template.cas9_complex_formation.gRNA_generic --participant .gRNA_generic --role Reactant
                    participation .CRISPR_Template.cas9_complex_formation.cas9_gRNA_complex --participant .cas9_gRNA_complex --role Product
                interaction .CRISPR_Template.target_production --type GeneticProduction
                    participation .CRISPR_Template.target_production.participant_target_gene --participant .target_gene --role Promoter
                    participation .CRISPR_Template.target_production.participant_target --participant .target --role Product
                interaction .CRISPR_Template.target_gene_inhibition --type Inhibition
                    participation .CRISPR_Template.target_gene_inhibition.participant_cas9_gRNA_complex --participant .cas9_gRNA_complex --role Inhibitor
                    participation .CRISPR_Template.target_gene_inhibition.participant_target_gene --participant .target_gene --role Promoter
            component .EYFP_gene --type DNA 
            component .EYFP_gene.CRP_b --type DNA --role Promoter
            sequence .CRP_b_seq --for-component .CRP_b --source ./test/data/CRP_b.fasta
            component .EYFP_gene.EYFP_cds --type DNA --role CDS
            constraint .EYFP_gene.EYFP_gene_constraint --subject .EYFP_gene.CRP_b --restriction Precedes --object .EYFP_gene.EYFP_cds
        `,

        validate: async (r:string|undefined) => {

            if(r === undefined) {
                throw new Error('no output')
            }

            let g = await Graph.loadString(r)
            let gv = new SBOL2GraphView(g)

            checkCrisprExample(g, gv)
        }
    }
]

export default tests


function checkCrisprExample(g: Graph, gv: SBOL2GraphView) {

    assert(gv.componentDefinitions.filter(c => c.displayId === 'cas9_generic').length === 1)
    assert(gv.componentDefinitions.filter(c => c.displayId === 'gRNA_generic').length === 1)
    assert(gv.componentDefinitions.filter(c => c.displayId === 'cas9_gRNA_complex').length === 1)
    assert(gv.componentDefinitions.filter(c => c.displayId === 'target_gene').length === 1)
    assert(gv.componentDefinitions.filter(c => c.displayId === 'target').length === 1)
    assert(gv.moduleDefinitions.filter(c => c.displayId === 'CRISPR_Template').length === 1)

    let CRISPR_Template = gv.moduleDefinitions.filter(c => c.displayId === 'CRISPR_Template')[0]

    let cas9_complex_formation = CRISPR_Template.interactions.filter(i => i.displayId === 'cas9_complex_formation')[0]
    assert(cas9_complex_formation)
    assert(cas9_complex_formation.types.length === 1)
    assert(cas9_complex_formation.hasType('http://identifiers.org/biomodels.sbo/SBO:0000177'))

    assert(cas9_complex_formation.participations.length === 3)
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'cas9_generic').length === 1)
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'cas9_generic')[0].hasRole('http://identifiers.org/biomodels.sbo/SBO:0000010'))
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'cas9_generic')[0].participant?.displayId === 'cas9_generic')
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'gRNA_generic').length === 1)
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'gRNA_generic')[0].hasRole('http://identifiers.org/biomodels.sbo/SBO:0000010'))
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'gRNA_generic')[0].participant?.displayId === 'gRNA_generic')
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'cas9_gRNA_complex').length === 1)
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'cas9_gRNA_complex')[0].hasRole('http://identifiers.org/biomodels.sbo/SBO:0000011'))
    assert(cas9_complex_formation.participations.filter(p => p.displayId === 'cas9_gRNA_complex')[0].participant?.displayId === 'cas9_gRNA_complex')



    let CRP_b_seq = gv.sequences.filter(seq => seq.displayId === 'CRP_b_seq')[0]
    assert(CRP_b_seq)
    assert(CRP_b_seq.elements)


    assert(gv.componentDefinitions.filter(c => c.displayId === 'CRP_b').length === 1)
    assert(gv.componentDefinitions.filter(c => c.displayId === 'CRP_b')[0].sequences.length === 1)
    assert(gv.componentDefinitions.filter(c => c.displayId === 'CRP_b')[0].sequences[0].displayId === 'CRP_b_seq')
}


