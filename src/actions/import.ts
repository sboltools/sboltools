
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView, SBOLImporter } from "sbolgraph"
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"
import GraphMap from "../GraphMap"

let createSequenceAction:ActionDef = {
    name: 'import',
    description: 'Import RDF, FASTA, or GenBank into the current graph',
    category: 'graph',
    positionalOpts: [
        {
            name: 'source',
            type: OptURL,
            optional: true
        }
    ],
    namedOpts: [  
        {
            name: 'as',
            type: OptString
        }
    ],
    run: _import,
    help: `
The source may be either the filename or URL of a serialized RDF resource, such as an SBOL1, 2, or 3 file; or the filename or URL of a FASTA or GenBank file.

In the case of a FASTA or GenBank target, the --as parameter specifies the RDF conversion target sbol1/sbol/sbol3.  For example,

    import foo.fasta --as sbol1

would result in a graph containing foo.fasta converted to SBOL1 RDF.
`
}

export default createSequenceAction

async function _import(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = gm.getCurrentGraph()

    let [ source ] = positionalOpts
    let [ _as ] = namedOpts

    assert(!_as || _as instanceof OptString)

    let url = source

    if(url === undefined) {
        return new ActionResult(group([]), Outcome.ShowHelp)
    }


    let format = _as ? _as.getString(g) : undefined

    switch (format) {
        case 'sbol1':
            g.addAll(await SBOLImporter.sbol1GraphFromFilenameOrURL(url, false))
            break
        case 'sbol2':
            g.addAll(await SBOLImporter.sbol2GraphFromFilenameOrURL(url, false))
            break
        case 'sbol3':
            g.addAll(await SBOLImporter.sbol3GraphFromFilenameOrURL(url, false))
            break
        default:
            await g.loadFilenameOrURL(url)
            break
    }

    return new ActionResult()
}
