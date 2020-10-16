import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sbolgraph";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";

export enum TermType {
    Role,
    ParticipationRole
}

export default class OptTerm extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }

    getTerm(type:TermType):string|undefined {
        let name = this.argv.getString(this.optDef.name, '')
        if(name.indexOf('://') !== -1) {
            return name
        }
        if(type === TermType.Role) {
            let uri = roleVocab[name]
            if(uri === undefined) {
                throw new ActionResult(text('Unknown term: ' + name))
            }
            return uri
        } else if(type == TermType.ParticipationRole) {
            let uri = participationRoleVocab[name]
            if(uri === undefined) {
                throw new ActionResult(text('Unknown term: ' + name))
            }
            return uri
        }
    }

}

let roleVocab = {
    'DNA': 'https://identifiers.org/SBO:0000251',
    'RNA': 'https://identifiers.org/SBO:0000250',
    'Protein': 'https://identifiers.org/SBO:0000252',
    'SimpleChemical': 'https://identifiers.org/SBO:0000247',
    'Chemical': 'https://identifiers.org/SBO:0000247',
    'Complex': 'https://identifiers.org/SBO:0000253',
    'NonCovalentComplex': 'https://identifiers.org/SBO:0000253',
    'FunctionalEntity': 'https://identifiers.org/SBO:0000241',
    'Functional': 'https://identifiers.org/SBO:0000241',
    'Linear': 'http://identifiers.org/so/SO:0000987',
    'Circular': 'http://identifiers.org/so/SO:0000988',
    'SingleStranded': 'http://identifiers.org/so/SO:0000984',
    'DoubleStranded': 'http://identifiers.org/so/SO:0000985',
    'Promoter': 'http://identifiers.org/so/SO:0000167',
    'RBS': 'http://identifiers.org/so/SO:0000139',
    'CDS': 'http://identifiers.org/so/SO:0000316',
    'Terminator': 'http://identifiers.org/so/SO:0000141',
    'Gene': 'http://identifiers.org/so/SO:0000704',
    'Operator': 'http://identifiers.org/so/SO:0000057',
    'EngineeredGene': 'http://identifiers.org/so/SO:0000280',
    'mRNA': 'http://identifiers.org/so/SO:0000234',
    'Effector': 'http://identifiers.org/chebi/CHEBI:35224',
    'TranscriptionFactor': 'http://identifiers.org/go/GO:0003700',
    'Inhibition': 'http://identifiers.org/biomodels.sbo/SBO:0000169',
    'Stimulation': 'http://identifiers.org/biomodels.sbo/SBO:0000170',
    'BiochemicalReaction': 'http://identifiers.org/biomodels.sbo/SBO:0000176',
    'NonCovalentBinding': 'http://identifiers.org/biomodels.sbo/SBO:0000177',
    'Degradation': 'http://identifiers.org/biomodels.sbo/SBO:0000179',
    'GeneticProduction': 'http://identifiers.org/biomodels.sbo/SBO:0000589',
    'Control': 'http://identifiers.org/biomodels.sbo/SBO:0000168',


}

let participationRoleVocab = {
    'Inhibitor': 'http://identifiers.org/biomodels.sbo/SBO:0000020',
    'Inhibited': 'http://identifiers.org/biomodels.sbo/SBO:0000642',
    'Stimulator': 'http://identifiers.org/biomodels.sbo/SBO:0000459',
    'Stimulated': 'http://identifiers.org/biomodels.sbo/SBO:0000643',
    'Reactant': 'http://identifiers.org/biomodels.sbo/SBO:0000010',
    'Product': 'http://identifiers.org/biomodels.sbo/SBO:0000011',
    'Promoter': 'http://identifiers.org/biomodels.sbo/SBO:0000598',
    'Modifier': 'http://identifiers.org/biomodels.sbo/SBO:0000019',
    'Modified': 'http://identifiers.org/biomodels.sbo/SBO:0000644',
    'Template': 'http://identifiers.org/biomodels.sbo/SBO:0000645',
}

