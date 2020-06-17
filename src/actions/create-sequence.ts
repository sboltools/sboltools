
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView } from "sbolgraph"
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"

let createSequenceAction:ActionDef = {
    name: 'create-sequence',
    description: 'Creates a sequence',
    category: 'object-cd',
    opts: [  
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
            type: OptString
        }
    ],
    run: createSequence,
    help: `
If the sequence identity is not specified, a default identity will be created from the component identity with \`_seq\` appended to its displayId.

If the encoding is not specified, it will be inferred from the component in the case that \`--for-component\` is specified (e.g. a DNA component will result in a nucleic acid sequence being created).

If such inference is not possible (e.g. no component is specified, or the specified component is of a type other than DNA, RNA, or Protein), an error will be thrown.
`
}

export default createSequenceAction

async function createSequence(g:Graph, opts:Opt[]):Promise<ActionResult> {

    let [ optIdentity, optForComponentIdentity, optSource, optEncoding ] = opts

    assert(optIdentity instanceof OptIdentity)
    assert(optForComponentIdentity instanceof OptIdentity)
    assert(optSource instanceof OptURL)
    assert(optEncoding instanceof OptString)

    let identity = optIdentity.getIdentity(g)
    assert(identity !== undefined)

    if(identity.sbolVersion === SBOLVersion.SBOL1) {
        
        if(!identity.parentURI) {
            throw new ActionResult(true, text('DnaSequence must have a parent in SBOL1, as unlike Sequence in SBOL2/3, it is not designated as top-level'))
        }

        let gv = new SBOL1GraphView(g)

        g.insertProperties(identity.uri, {
            [Predicates.a]: node.createUriNode(Types.SBOL1.DnaSequence)
        })

    }

    return new ActionResult(false)
}
