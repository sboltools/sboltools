
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Filetype, Graph, identifyFiletype, node } from "rdfoo"
import ActionResult, { Outcome } from "./ActionResult"
import Opt from "./opt/Opt"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { SBOL1GraphView, SBOL2GraphView, SBOLConverter } from "sbolgraph"
import OptIdentity from "./opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "./opt/OptURL"
import OptString from "./opt/OptString"
import Context from "../Context"
import * as fs from 'fs'
import importToGraph from "./helpers/import-to-graph"
import { trace } from "../output/print"

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

The --as parameter specifies the RDF conversion target sbol1/sbol/sbol3.  For example,

    import foo.fasta --as sbol1

would result in a graph containing foo.fasta converted to SBOL1 RDF. Without an --as parameter, the SBOL will be imported as-is.  The --as parameter
for FASTA/GenBank imports defaults to SBOL3.
`
}

export default createSequenceAction

async function _import(ctx:Context,  namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    let [ source ] = positionalOpts
    let [ _as ] = namedOpts

    assert(source instanceof OptURL)
    assert(!_as || _as instanceof OptString)

    trace(text('Import: positional opts ' + JSON.stringify(positionalOpts)));

    let format = _as ? _as.getString(g) : undefined

    let src = await source.downloadToString()

    await importToGraph(g, src, format)

    return new ActionResult()
}
