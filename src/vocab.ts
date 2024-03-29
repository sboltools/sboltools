import ActionResult from "./actions/ActionResult"
import { text } from "./output/output"
import TwoWayMapping from "./TwoWayMapping"

export enum TermType {
    Role = 'Role',
    InteractionType = 'InteractionType',
    ParticipationRole = 'ParticipationRole',
    RestrictionSBOL2 = 'RestrictionSBOL2',
    RestrictionSBOL3 = 'RestrictionSBOL3',
    SequenceEncodingSBOL2 = 'SequenceEncodingSBOL2',
    SequenceEncodingSBOL3 = 'SequenceEncodingSBOL3',
    ComponentTypeSBOL2 = 'ComponentTypeSBOL2',
    ComponentTypeSBOL3 = 'ComponentTypeSBOL3'
}


    export function termShorthandToUri(type:TermType, name:string):string|undefined {
        if(name.indexOf('://') !== -1) {
            return name
        }
        if(type === TermType.Role) {
            var uri = roleVocab.aToB(name.toLowerCase())
        } else if(type === TermType.InteractionType) {
            var uri = interactionTypeVocab.aToB(name.toLowerCase())
        } else if(type == TermType.ParticipationRole) {
            var uri = participationRoleVocab.aToB(name.toLowerCase())
        } else if(type == TermType.RestrictionSBOL2) {
            var uri = restrictionVocabSBOL2.aToB(name.toLowerCase())
        } else if(type == TermType.RestrictionSBOL3) {
            var uri = restrictionVocabSBOL3.aToB(name.toLowerCase())
        } else if(type == TermType.SequenceEncodingSBOL2) {
            var uri = sequenceEncodingVocabSBOL2.aToB(name.toLowerCase())
        } else if(type == TermType.SequenceEncodingSBOL3) {
            var uri = sequenceEncodingVocabSBOL3.aToB(name.toLowerCase())
        } else if(type == TermType.ComponentTypeSBOL2) {
            var uri = componentTypeVocabSBOL2.aToB(name.toLowerCase())
        } else if(type == TermType.ComponentTypeSBOL3) {
            var uri = componentTypeVocabSBOL3.aToB(name.toLowerCase())
        }
        if (uri === undefined) {
            throw new ActionResult(text('Unknown term: ' + name + ' for term type ' + type))
        }
        return uri
    }

    export function termUriToShorthand(type:TermType, uri:string) {
        if(type === TermType.Role) {
            var short = roleVocab.bToA(uri.toLowerCase())
        } else if(type === TermType.InteractionType) {
            var short = interactionTypeVocab.bToA(uri.toLowerCase())
        } else if(type == TermType.ParticipationRole) {
            var short = participationRoleVocab.bToA(uri.toLowerCase())
        } else if(type == TermType.RestrictionSBOL2) {
            var short = restrictionVocabSBOL2.bToA(uri.toLowerCase())
        } else if(type == TermType.RestrictionSBOL3) {
            var short = restrictionVocabSBOL3.bToA(uri.toLowerCase())
        } else if(type == TermType.SequenceEncodingSBOL2) {
            var short = sequenceEncodingVocabSBOL2.bToA(uri.toLowerCase())
        } else if(type == TermType.SequenceEncodingSBOL3) {
            var short = sequenceEncodingVocabSBOL3.bToA(uri.toLowerCase())
        } else if(type == TermType.ComponentTypeSBOL2) {
            var short = componentTypeVocabSBOL2.bToA(uri.toLowerCase())
        } else if(type == TermType.ComponentTypeSBOL3) {
            var short = componentTypeVocabSBOL3.bToA(uri.toLowerCase())
        }
        if (short === undefined) {
            return uri
        }
        return short
    }

let roleVocab = new TwoWayMapping({
    'dna': 'https://identifiers.org/SBO:0000251',
    'rna': 'https://identifiers.org/SBO:0000250',
    'protein': 'https://identifiers.org/SBO:0000252',
    'simplechemical': 'https://identifiers.org/SBO:0000247',
    'chemical': 'https://identifiers.org/SBO:0000247',
    'complex': 'https://identifiers.org/SBO:0000253',
    'noncovalentcomplex': 'https://identifiers.org/SBO:0000253',
    'functionalentity': 'https://identifiers.org/SBO:0000241',
    'functional': 'https://identifiers.org/SBO:0000241',
    'linear': 'http://identifiers.org/so/SO:0000987',
    'circular': 'http://identifiers.org/so/SO:0000988',
    'singlestranded': 'http://identifiers.org/so/SO:0000984',
    'doublestranded': 'http://identifiers.org/so/SO:0000985',
    'promoter': 'http://identifiers.org/so/SO:0000167',
    'rbs': 'http://identifiers.org/so/SO:0000139',
    'cds': 'http://identifiers.org/so/SO:0000316',
    'terminator': 'http://identifiers.org/so/SO:0000141',
    'gene': 'http://identifiers.org/so/SO:0000704',
    'operator': 'http://identifiers.org/so/SO:0000057',
    'engineeredgene': 'http://identifiers.org/so/SO:0000280',
    'mrna': 'http://identifiers.org/so/SO:0000234',
    'effector': 'http://identifiers.org/chebi/CHEBI:35224',
    'transcriptionfactor': 'http://identifiers.org/go/GO:0003700'
})

let interactionTypeVocab = new TwoWayMapping({
    'inhibition': 'http://identifiers.org/biomodels.sbo/SBO:0000169',
    'stimulation': 'http://identifiers.org/biomodels.sbo/SBO:0000170',
    'biochemicalreaction': 'http://identifiers.org/biomodels.sbo/SBO:0000176',
    'noncovalentbinding': 'http://identifiers.org/biomodels.sbo/SBO:0000177',
    'degradation': 'http://identifiers.org/biomodels.sbo/SBO:0000179',
    'geneticproduction': 'http://identifiers.org/biomodels.sbo/SBO:0000589',
    'control': 'http://identifiers.org/biomodels.sbo/SBO:0000168',
})

let participationRoleVocab = new TwoWayMapping({
    'inhibitor': 'http://identifiers.org/biomodels.sbo/SBO:0000020',
    'inhibited': 'http://identifiers.org/biomodels.sbo/SBO:0000642',
    'stimulator': 'http://identifiers.org/biomodels.sbo/SBO:0000459',
    'stimulated': 'http://identifiers.org/biomodels.sbo/SBO:0000643',
    'reactant': 'http://identifiers.org/biomodels.sbo/SBO:0000010',
    'product': 'http://identifiers.org/biomodels.sbo/SBO:0000011',
    'promoter': 'http://identifiers.org/biomodels.sbo/SBO:0000598',
    'modifier': 'http://identifiers.org/biomodels.sbo/SBO:0000019',
    'modified': 'http://identifiers.org/biomodels.sbo/SBO:0000644',
    'template': 'http://identifiers.org/biomodels.sbo/SBO:0000645',
})


let restrictionVocabSBOL2 = new TwoWayMapping({
    'precedes': 'http://sbols.org/v2#precedes'
})

let restrictionVocabSBOL3 = new TwoWayMapping({
    'precedes': 'http://sbols.org/v3#precedes',
})


let sequenceEncodingVocabSBOL2 = new TwoWayMapping({
    'nucleicacid': 'http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html',
    'dna': 'http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html',
    'rna': 'http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html',
    'protein': 'http://www.chem.qmul.ac.uk/iupac/AminoAcid/',
    'smiles': 'http://www.opensmiles.org/opensmiles.html'
})

let sequenceEncodingVocabSBOL3 = new TwoWayMapping({
    'nucleicacid': 'http://sbols.org/v3#iupacNucleicAcid',
    'dna': 'http://sbols.org/v3#iupacNucleicAcid',
    'rna': 'http://sbols.org/v3#iupacNucleicAcid',
    'aminoacid': 'http://sbols.org/v3#iupacAminoAcid',
    'protein': 'http://sbols.org/v3#iupacAminoAcid',
    'smiles': 'http://www.opensmiles.org/opensmiles.html',
    'chemical': 'http://www.opensmiles.org/opensmiles.html'
})

let componentTypeVocabSBOL2 = new TwoWayMapping({
    'dna': 'http://www.biopax.org/release/biopax-level3.owl#Dna',
    'dnamolecule': 'http://www.biopax.org/release/biopax-level3.owl#Dna',
    'dnaregion': 'http://www.biopax.org/release/biopax-level3.owl#DnaRegion',
    'rna': 'http://www.biopax.org/release/biopax-level3.owl#Rna',
    'rnamolecule': 'http://www.biopax.org/release/biopax-level3.owl#Rna',
    'rnaregion': 'http://www.biopax.org/release/biopax-level3.owl#RnaRegion',
    'protein': 'http://www.biopax.org/release/biopax-level3.owl#Protein',
    'smallmolecule': 'http://www.biopax.org/release/biopax-level3.owl#SmallMolecule',
    'complex': 'http://www.biopax.org/release/biopax-level3.owl#Complex'
})

let componentTypeVocabSBOL3 = new TwoWayMapping({
    'dna': 'https://identifiers.org/SBO:0000251',
    'dnamolecule': 'https://identifiers.org/SBO:0000251',
    'dnaregion': 'https://identifiers.org/SBO:0000251',
    'rna': 'https://identifiers.org/SBO:0000250',
    'protein': 'https://identifiers.org/SBO:0000252',
    'chemical': 'https://identifiers.org/SBO:0000247',
    'simplechemical': 'https://identifiers.org/SBO:0000247',
    'noncovalentcomplex': 'https://identifiers.org/SBO:0000253',
    'complex': 'https://identifiers.org/SBO:0000253',
    'functionalentity': 'https://identifiers.org/SBO:0000241',
    'module': 'https://identifiers.org/SBO:0000241',
})


