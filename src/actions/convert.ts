
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph } from "rdfoo"
import { SBOLConverter, SBOL3GraphView, SBOL2GraphView, SBOL1GraphView } from "sbolgraph"
import ActionResult, { Outcome, actionResult } from "./ActionResult"
import ActionDef from "./ActionDef"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import Opt from "./opt/Opt"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import Context from "../Context"
import OptFlag from "./opt/OptFlag"
import action from "./dump-graph"
import OutputNode from "../output/OutputNode"
import fetch from 'node-fetch'
import { getSBOLVersionFromGraph } from '../util/get-sbol-version-from-graph'
import { trace } from "../output/print"

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
            name: 'online',
            type: OptFlag,
            optional: true
        }
    ],
    positionalOpts: [
    ],
    run: convert
}

export default convertAction

async function convert(ctx:Context, namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    let [ target, online ] = namedOpts

    assert(target instanceof OptSBOLVersion)
    assert(online instanceof OptFlag)

    let sbolVersion = target.getSBOLVersion(g)

    if(online.isSet()) {
        return convertVC(g, sbolVersion)
    } else {
        return convertOffline(g, sbolVersion)
    }
}

async function convertOffline(g:Graph, sbolVersion:SBOLVersion):Promise<ActionResult> {

    if(sbolVersion === SBOLVersion.SBOL1) {

        trace(text('Offline converting 3->2 and 2->1'))

        await SBOLConverter.convert3to2(g)
        await SBOLConverter.convert2to1(g)

    } else if(sbolVersion === SBOLVersion.SBOL2) {

        trace(text('Offline converting 1->2 and 3->2'))

        await SBOLConverter.convert1to2(g)
        await SBOLConverter.convert3to2(g)

    } else if(sbolVersion === SBOLVersion.SBOL3) {

        trace(text('Offline converting 1->2 and 2->3'))

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

    let sourceVersion:SBOLVersion = getSBOLVersionFromGraph(g)
    let xml = ''

    if(sourceVersion === SBOLVersion.SBOL1) {
        xml = new SBOL1GraphView(g).serializeXML()
    } else if(sourceVersion === SBOLVersion.SBOL2) {
        xml = new SBOL2GraphView(g).serializeXML()
    } else if(sourceVersion === SBOLVersion.SBOL3) {
        throw new ActionResult(text('convert: cannot convert from SBOL3 using the online validator/converter'), Outcome.Abort)
    } else if(sourceVersion === SBOLVersion.Mixed) {
        throw new ActionResult(text('convert: graph has mixed SBOL versions so cannot use online validator/converter'), Outcome.Abort)
    } else if(sourceVersion === SBOLVersion.Empty) {
        xml = new SBOL2GraphView(g).serializeXML()
    } else {
        throw new ActionResult(text('convert: unknown source SBOLVersion ' + sourceVersion))
    }

    let target = ''

    if(sbolVersion === SBOLVersion.SBOL1) {
        target = 'sbol1'
    } else if(sbolVersion === SBOLVersion.SBOL2) {
        target = 'sbol2'
    } else if(sbolVersion === SBOLVersion.SBOL3) {
        throw new ActionResult(text('convert: cannot convert to SBOL3 using the online validator/converter'), Outcome.Abort)
    } else {
        throw new ActionResult(text('convert: unknown SBOLVersion ' + sbolVersion))
    }

    trace(text(`convert: target language sent to validator/converter is ${target.toUpperCase()}`))

    let body = {
        options: {
            language: target.toUpperCase(), // output language
            test_equality: false,
            check_uri_compliance: false,
            check_completeness: false,
            check_best_practices: false,
            fail_on_first_error: false,
            provide_detailed_stack_trace: false,
            subset_uri: '',
            uri_prefix: '',
            version: '',
            insert_type: false,
            main_file_name: 'main file',
            diff_file_name: 'comparison file'
        },
        main_file: xml,
        return_file: true
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

    if(!valid) {
        if(errors.length > 0) {
            output.push(spacer())
            output.push(group(errors.map(e => text('Online validator error: ' + e))))
            output.push(spacer())
        }
    }

    if(result) {

        // console.log('before delete')
        // console.log(new SBOL3GraphView(g).serializeXML())

        if(sourceVersion === SBOLVersion.SBOL1) {
            for(let topLevel of new SBOL1GraphView(g).topLevels) {
                topLevel.destroy()
            }
        } else if(sourceVersion === SBOLVersion.SBOL2) {
            for(let topLevel of new SBOL2GraphView(g).topLevels) {
                topLevel.destroy()
            }
        }

        // console.log('after delete')
        // console.log(new SBOL3GraphView(g).serializeXML())

        g.addAll(await Graph.loadString(result, 'http://dummyprefix/', 'application/rdf+xml'))
    }

    return actionResult(group(output))
}









