
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph } from "rdfoo"
import { SBOL1GraphView, SBOL2GraphView, SBOLImporter, SBOL3GraphView } from "sbolgraph"
import fetch = require('node-fetch')
import ActionResult from "./ActionResult"
import OutputNode from "../output/OutputNode"
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"



let vcValidateAction:ActionDef = {
    name: 'vc-validate',
    category: 'vc',
    opts: [
    ],
    run: vcValidate
}

export default vcValidateAction

async function vcValidate(g:Graph, opts:Opt[]):Promise<ActionResult> {

    return new ActionResult(false, group([]))
}



// export default async function vcValidate(g:Graph, opts:ActionOpts):Promise<ActionResult> {

//     let sbolversion = opts.getSBOLVersion()

//     let target = opts.getString('target', 'sbol2').toUpperCase()
//     let check_uri_compliance = opts.getBoolean('check-uri-compliance', true)
//     let check_completeness = opts.getBoolean('check-completeness', true)
//     let check_best_practices = opts.getBoolean('check-best-practices', false)
//     let fail_on_first_error = opts.getBoolean('fail-on-first-error', false)
//     let provide_detailed_stack_trace = opts.getBoolean('provide-detailed-stack-trace', false)
//     let subset_uri = opts.getString('subset-uri', '')
//     let uri_prefix = opts.getString('uri-prefix', '')
//     let version = opts.getString('version', '')
//     let insert_type = opts.getBoolean('insert-type', false)


//     let body = {
//         options: {
//             language: target, // output language
//             test_equality: false,
//             check_uri_compliance,
//             check_completeness,
//             check_best_practices,
//             fail_on_first_error,
//             provide_detailed_stack_trace,
//             subset_uri,
//             uri_prefix,
//             version,
//             insert_type,
//             main_file_name: 'main file',
//             diff_file_name: 'comparison file'
//         },
//         main_file: new SBOL1GraphView(g).serializeXML(),
//         return_file: false,
//         diff_file: ''
//     }

//     let r = await fetch('https://validator.sbolstandard.org/validate/', {
//         method: 'POST',
//         headers: {
//             'content-type': 'application/json'
//         },
//         body: JSON.stringify(body)
//     })

//     try {
//         var response = await r.json()
//     } catch(e) {
//         return new ActionResult(true, text('The online validator/converter failed: ' + e))
//     }

//     let { valid, check_equality, equality, errors, output_file, result } = response

//     let output:OutputNode[] = []

//     if(!valid) {
//         output.push(group([
//             spacer(),
//             text('The online validator/converter said the SBOL sent by sboltools was invalid'),
//             text('This should not happen, and is likely indicative of a bug in sboltools'),
//             spacer()
//         ]))
//     }

//     errors = errors.filter(e => e.trim() != '')

//     if(errors.length > 0) {
//         output.push(spacer())
//         output.push(group(errors.map(e => text('Online validator error: ' + e))))
//         output.push(spacer())
//     }

//     return new ActionResult(false, group(output))
// }




