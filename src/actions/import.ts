
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
import GraphMap from "../GraphMap"
import * as fs from 'fs'
import fetch from 'node-fetch'

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

async function _import(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = gm.getCurrentGraph()

    let [ source ] = positionalOpts
    let [ _as ] = namedOpts

    assert(!_as || _as instanceof OptString)

    let url = source

    if(url === undefined) {
        return new ActionResult(group([]), Outcome.ShowHelp)
    }

    var src

    if(isURL(url)) {
        src = await (await fetch(url)).text()
    } else {
        src = fs.readFileSync(url) + ''
    }

    let ft = identifyFiletype(src, '')


    let format = _as ? _as.getString(g) : undefined

    if(!format) {

        // Import as-is

        if(ft === Filetype.RDFXML || ft === Filetype.NTriples) {
            g.loadString(src)
            return new ActionResult()
        } else {

            // GenBank/FASTA/etc
            //
            throw new ActionResult(text('Please specify a conversion target --as for GenBank/FASTA files'), Outcome.Abort)
        }

    }

    // Convert on import
    
    let tempg = new Graph()

    if(ft === Filetype.RDFXML || ft === Filetype.NTriples) {
        tempg.loadString(src)
    } else {

        // import GenBank/FASTA as SBOL2 first
        new SBOL2GraphView(tempg).loadString(src)
    }


    switch (format) {
        case 'sbol1':
            await SBOLConverter.convert3to2(tempg)
            await SBOLConverter.convert2to1(tempg)
            break
        case 'sbol2':
            await SBOLConverter.convert3to2(tempg)
            await SBOLConverter.convert1to2(tempg)
            break
        case 'sbol3':
        default:
            await SBOLConverter.convert1to2(tempg)
            await SBOLConverter.convert2to3(tempg)
            break
    }

    g.addAll(tempg)

    return new ActionResult()
}


async function get(url:string):Promise<string> {

    let r = await fetch(url)

    return await r.text()

}

async function load(filename:string):Promise<string> {
    return await new Promise((resolve, reject) => {
        fs.readFile(filename, (err, file) => {
            if (err)
                reject(err)
            else
                resolve(file.toString())
        })
    })
}

function isURL(str:string):boolean {
    return str.indexOf('://') !== -1 // TODO!
}


