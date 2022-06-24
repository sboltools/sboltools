


import { text, group, spacer, header, indent, conditional } from "../../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent, SBOL2GraphView, SBOL3GraphView } from "sboljs"
import OptIdentity from "../opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptTerm  from "../opt/OptTerm"
import { Existence } from "../../identity/IdentityFactory"
import Identity from "../../identity/Identity"
import sbol2CompliantConcat from "../../util/sbol2-compliant-concat"
import joinURIFragments from "../../util/join-uri-fragments"
import { trace } from "../../output/print";
import Context from "../../Context"
import OptURL from "../opt/OptURL"


let createSequenceAction:ActionDef = {
    name: 'sequence',
    description: 'Creates a sequence',
    category: 'object-cd',
    namedOpts: [
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'for-component',
            type: OptIdentity
        },
        {
            name: 'source',
            type: OptURL
        },
        {
            name: 'encoding',
            type: OptTerm
        }
    ],
    positionalOpts: [
    ],
    run: createSequence,
    help: `
If the sequence identity is not specified, a default identity will be created from the component identity with \`_seq\` appended to its displayId.

If the encoding is not specified, it will be inferred from the component in the case that \`--for-component\` is specified (e.g. a DNA component will result in a nucleic acid sequence being created).

If such inference is not possible (e.g. no component is specified, or the specified component is of a type other than DNA, RNA, or Protein), an error will be thrown.
`
}

export default createSequenceAction

async function createSequence(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    let [ optIdentity, optForComponentIdentity, optSource, optEncoding ] = namedOpts

    assert(optIdentity instanceof OptIdentity)
    assert(optSource instanceof OptURL)
    assert(optForComponentIdentity instanceof OptIdentity)
    assert(optEncoding instanceof OptTerm)

    let forComponentIdentity = optForComponentIdentity.getIdentity(ctx, Existence.MustExist)

    let identity = optIdentity.getIdentity(ctx, Existence.MustNotExist)
    assert(identity !== undefined)


    let source = await optSource.downloadToString()
    let sourceG = new Graph()
    await importToGraph(sourceG, source, 'sbol3')
    let sourceGV = new SBOL3GraphView(sourceG)

    if(sourceGV.sequences.length !== 1) {
        throw new ActionResult(text('Source did not evaluate to exactly one sequence'))
    }

    let elements = sourceGV.sequences[0].elements
    assert(elements)


    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL1:
            return createSequenceSBOL1(g, identity, forComponentIdentity, encoding, elements)
        case SBOLVersion.SBOL2:
            var encoding = optEncoding.getTerm(TermType.SequenceEncodingSBOL2)
            return createSequenceSBOL2(g, identity, forComponentIdentity, encoding, elements)
        case SBOLVersion.SBOL3:
            var encoding = optEncoding.getTerm(TermType.SequenceEncodingSBOL3)
            assert(encoding)
            return createSequenceSBOL3(g, identity, forComponentIdentity, encoding, elements)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'), Outcome.Abort)
    }
}

function createSequenceSBOL1(g:Graph, identity:Identity, forComponentIdentity:Identity|undefined, encoding:string|undefined, elements:string):ActionResult {

    let gv = new SBOL1GraphView(g)

    if (!identity.parentURI) {
        throw new ActionResult(text('DnaSequence must have a parent in SBOL1, as unlike Sequence in SBOL2/3, it is not designated as top-level'), Outcome.Abort)
    }

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL1.DnaSequence),
        [Predicates.SBOL1.nucleotides]: node.createStringNode(elements)
    })

    g.insertProperties(node.createUriNode(identity.parentURI), {
        [Predicates.SBOL1.dnaSequence]: node.createUriNode(identity.uri)
    })

    return new ActionResult()
}


function createSequenceSBOL2(g:Graph, identity:Identity, forComponentIdentity:Identity|undefined, encoding:string|undefined, elements:string):ActionResult {

    let gv = new SBOL2GraphView(g)

    if (identity.parentURI) {
        throw new ActionResult(text('Sequence cannot have a parent in SBOL2/3, as unlike DnaSequence in SBOL1, it is not designated as top-level. Consider using the --for-component option instead to attach the sequence to a component upon creation.'), Outcome.Abort)
    }

    if(!encoding) {
        if(forComponentIdentity !== undefined) {
            let component = gv.subjectToFacade(node.createUriNode(forComponentIdentity.uri))
            assert(component instanceof S2ComponentDefinition)

            trace(text('Attempting to infer seq encoding from component with types ' + component.types.join(', ')))
            trace(text(Specifiers.SBOL2.Type.DNA))
            trace(text(Specifiers.SBOL2.SequenceEncoding.NucleicAcid))

            encoding = typesToEncoding(component.types)
        }
    }

    if(!encoding) {
        throw new ActionResult(text('Cannot infer sequence encoding from component type; please specify an encoding'), Outcome.Abort)
    }

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.Sequence),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL2.encoding]: node.createUriNode(encoding),
        [Predicates.SBOL2.elements]: node.createStringNode(elements)
    })

    if(identity.version) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    if(forComponentIdentity !== undefined) {
        g.insertProperties(node.createUriNode(forComponentIdentity.uri), {
            [Predicates.SBOL2.sequence]: node.createUriNode(identity.uri)
        })
    }

    return new ActionResult()
}

function createSequenceSBOL3(g:Graph, identity:Identity, forComponentIdentity:Identity|undefined, encoding:string|undefined, elements:string):ActionResult {


    return new ActionResult()
}

function typesToEncoding(types:string[]):string {

    if (types.indexOf('http://www.biopax.org/release/biopax-level3.owl#Dna') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else if (types.indexOf('http://www.biopax.org/release/biopax-level3.owl#DnaRegion') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else if (types.indexOf('http://www.biopax.org/release/biopax-level3.owl#Rna') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else if (types.indexOf('http://www.biopax.org/release/biopax-level3.owl#RnaRegion') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else if (types.indexOf('http://www.biopax.org/release/biopax-level3.owl#Protein') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.AminoAcid
    } else if (types.indexOf('http://www.biopax.org/release/biopax-level3.owl#Protein') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.AminoAcid
    } else if (types.indexOf('https://identifiers.org/SBO:0000251') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else if (types.indexOf('https://identifiers.org/SBO:0000251') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else if (types.indexOf('https://identifiers.org/SBO:0000252') !== -1) {
        return Specifiers.SBOL2.SequenceEncoding.AminoAcid
    }

    assert(false)
}

