
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph } from "rdfoo"
import { SBOLConverter, SBOL3GraphView, SBOL2GraphView, SBOL1GraphView, SBOLImporter } from "sbolgraph"
import ActionResult, { Outcome, actionResult } from "./ActionResult"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import Opt from "./opt/Opt"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import GraphMap from "../GraphMap"
import OptFlag from "./opt/OptFlag"
import action from "./dump-graph"
import OutputNode from "../output/OutputNode"
import fetch from 'node-fetch'


let convertAction:ActionDef = {
    name: 'convert',
    category: 'local-conversion',
    namedOpts: [
        {
            name: 'target',
            type: OptSBOLVersion,
            refinements: {
                infer: false
            }
        },
        {
            name: 'offline',
            type: OptFlag,
            optional: true
        }
    ],
    positionalOpts: [
    ],
    run: convert
}

export default convertAction

async function convert(gm:GraphMap, namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = gm.getCurrentGraph()

    let [ target, offline ] = namedOpts

    assert(target instanceof OptSBOLVersion)
    assert(offline instanceof OptFlag)

    let sbolVersion = target.getSBOLVersion(g)

    if(offline.isSet() || sbolVersion === SBOLVersion.SBOL3) {
        return convertOffline(g, sbolVersion)
    } else {
        return convertVC(g, sbolVersion)
    }
}

async function convertOffline(g:Graph, sbolVersion:SBOLVersion):Promise<ActionResult> {

    if(sbolVersion === SBOLVersion.SBOL1) {

        return new ActionResult(text('Offline conversion to SBOL1 is not yet implemented'), Outcome.Abort)

    } else if(sbolVersion === SBOLVersion.SBOL2) {

        await SBOLConverter.convert1to2(g)
        await SBOLConverter.convert3to2(g)

    } else if(sbolVersion === SBOLVersion.SBOL3) {

        await SBOLConverter.convert1to2(g)
        await SBOLConverter.convert2to3(g)

    } else {

        return new ActionResult(text('convert: target must be one of sbol1, sbol2, sbol3'), Outcome.Abort)
    }

    return actionResult()
}

async function convertVC(g:Graph, sbolVersion:SBOLVersion):Promise<ActionResult> {

    // let target = opts.getString('target', 'sbol2').toUpperCase()
    // let check_uri_compliance = opts.getBoolean('check-uri-compliance', true)
    // let check_completeness = opts.getBoolean('check-completeness', true)
    // let check_best_practices = opts.getBoolean('check-best-practices', false)
    // let fail_on_first_error = opts.getBoolean('fail-on-first-error', false)
    // let provide_detailed_stack_trace = opts.getBoolean('provide-detailed-stack-trace', false)
    // let subset_uri = opts.getString('subset-uri', '')
    // let uri_prefix = opts.getString('uri-prefix', '')
    // let version = opts.getString('version', '')
    // let insert_type = opts.getBoolean('insert-type', false)

    let target = ''

    if(sbolVersion === SBOLVersion.SBOL1) {
        target = 'sbol1'
    } else if(sbolVersion === SBOLVersion.SBOL2) {
        target = 'sbol2'
    } else if(sbolVersion === SBOLVersion.SBOL3) {
        target = 'sbol3'
    } else {
        assert(false)
    }

    let body = {
        options: {
            language: target, // output language
            test_equality: false,
            check_uri_compliance: false,
            check_completeness: false,
            check_best_practices: false,
            fail_on_first_error: false,
            provide_detailed_stack_trace: true,
            subset_uri: '',
            uri_prefix: '',
            version: '',
            insert_type: '',
            main_file_name: 'main file',
            diff_file_name: 'comparison file'
        },
        main_file: new SBOL3GraphView(g).serializeXML(),
        return_file: false,
        diff_file: ''
    }

    let r = await fetch('https://validator.sbolstandard.org/validate/', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    try {
        var response = await r.json()
    } catch(e) {
        return actionResult(text('The online validator/converter failed: ' + e))
    }

    let { valid, check_equality, equality, errors, output_file, result } = response

    let output:OutputNode[] = []

    if(!valid) {
        throw actionResult(group([
            spacer(),
            text('The online validator/converter said the SBOL sent by sboltools was invalid'),
            text('This should not happen, and is likely indicative of a bug in sboltools'),
            spacer()
        ]))
    }

    errors = errors.filter(e => e.trim() != '')

    if(errors.length > 0) {
        output.push(spacer())
        output.push(group(errors.map(e => text('Online validator error: ' + e))))
        output.push(spacer())
    }

    if(result) {

        if(sbolVersion === SBOLVersion.SBOL1) {
            for(let topLevel of new SBOL1GraphView(g).topLevels) {
                topLevel.destroy()
            }
            g.addAll(
                await SBOLImporter.sbol1GraphFromString(result, false, 'application/rdf+xml')
            )
        } else if(sbolVersion === SBOLVersion.SBOL2) {
            for(let topLevel of new SBOL2GraphView(g).topLevels) {
                topLevel.destroy()
            }
            g.addAll(
                await SBOLImporter.sbol2GraphFromString(result, false, 'application/rdf+xml')
            )
        } else if(sbolVersion === SBOLVersion.SBOL3) {
            for(let topLevel of new SBOL3GraphView(g).topLevels) {
                topLevel.destroy()
            }
            g.addAll(
                await SBOLImporter.sbol3GraphFromString(result, false, 'application/rdf+xml')
            )
        }

    }

    return actionResult(group(output))
}









