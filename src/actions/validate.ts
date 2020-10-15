
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph } from "rdfoo"
import { SBOL1GraphView, SBOL2GraphView, SBOL3GraphView } from "sbolgraph"
import fetch = require('node-fetch')
import ActionResult, { actionResult, Outcome } from "./ActionResult"
import OutputNode from "../output/OutputNode"
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import GraphMap from "../GraphMap"
import { SBOLVersion, getSBOLVersionFromGraph } from "../util/get-sbol-version-from-graph"
import OptSBOLVersion from "./opt/OptSBOLVersion"
import assert = require("assert")
import { trace } from "../output/print"



let vcValidateAction:ActionDef = {
    name: 'validate',
    category: 'vc',
    namedOpts: [
    ],
    positionalOpts: [
    ],
    run: vcValidate
}

export default vcValidateAction

async function vcValidate(gm:GraphMap,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

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

    let g = gm.getCurrentGraph()

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

    let body = {
        options: {
            //language: vcTarget.toUpperCase(), // output language
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

    //console.log(JSON.stringify(response, null, 2))

    let { valid, check_equality, equality, errors, output_file, result } = response

    let output:OutputNode[] = []

    errors = errors.filter(e => e.trim() != '')

    if(!valid) {
        if(errors.length > 0) {
            output.push(spacer())
            output.push(group(errors.map(e => text('Online validator error: ' + e))))
            output.push(spacer())
        }
    }


    if(valid) {

        output.push(text('validate: the validator/converter said: valid!'))

    } else {
        output.push(
            spacer(),
            text('The online validator/converter said the SBOL sent by sboltools was invalid'),
            text('This should not happen, and is likely indicative of a bug in sboltools'),
            spacer()
        )

        throw new ActionResult(group(output), Outcome.Abort)
    }


    if(result) {

        output.push(text('validate: have result'))

    } else {

        output.push(text('validate: do not have result'))

    }

    return actionResult(group(output))
}


