import { text, group, spacer, header, indent, conditional } from "../../output/output"
import { Filetype, Graph, identifyFiletype, node } from "rdfoo"
import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import OptSBOLVersion from "../opt/OptSBOLVersion"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../../util/get-sbol-version-from-graph"
import { SBOL1GraphView, SBOL2GraphView, SBOLConverter } from "sboljs"
import OptIdentity from "../opt/OptIdentity"
import { Predicates, Types } from "bioterms"
import OptURL from "../opt/OptURL"
import OptString from "../opt/OptString"
import Context from "../../Context"
import * as fs from 'fs/promises'
import fetch from 'node-fetch';

export default async function importToGraph(g:Graph, src:string, format:string|undefined) {

    let ft = identifyFiletype(src, '')


    if(!format) {

        // Import as-is

        if(ft === Filetype.RDFXML || ft === Filetype.NTriples) {
            await g.loadString(src)
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
        await tempg.loadString(src)
    } else {

        // import GenBank/FASTA as SBOL2 first
        await (new SBOL2GraphView(tempg).loadString(src))
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
}

