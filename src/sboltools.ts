

import { SBOL3GraphView, Graph, SBOL1GraphView, SBOL2GraphView, SBOLImporter } from 'sbolgraph'

import { print, enableTrace, trace } from './output/print'

import actions from './actions'
import parseArgv from './parse-argv'

import helptext from './help'
import summarize from './summarize'
import ActionResult, { Outcome } from './actions/ActionResult'
import chalk = require('chalk')
import { text, spacer, group } from './output/output'
import { extractPrefixesFromGraph } from './identity/helpers/extractPrefixesFromGraph'
import ActionDef, { def2usage } from './actions/ActionDef'
import Opt from './actions/opt/Opt'
export default async function sboltools(args:string[]):Promise<string|undefined> {

    // console.dir(args)

    let argv = parseArgv(args)

    // console.dir(argv)


    if(argv.actions.length === 0 ||
            (argv.globalOpts.getFlag('help') || argv.globalOpts.getFlag('h'))) {

        help()
        return

    }

    if(argv.globalOpts.getFlag('trace')) {
        enableTrace()
        trace(text('sboltools trace output is enabled'))
    }

    let output = argv.globalOpts.getString('output', 'summary')

    let g = new Graph()


    let aborted = false

    for(let action of argv.actions) {

        let actDef:ActionDef = actions.filter(a => a.name === action.name)[0]

        if(actDef === undefined) {
            print(text('Unknown action: ' + action.name))
            break
        }

        if(action.namedOpts.getFlag('help') || action.namedOpts.getFlag('h')) {
            help()
            break
        }

        let namedOpts = actDef.namedOpts.map(optDef => new optDef.type(actDef, optDef, action.namedOpts))
        let err = false

        try {
            var actionResult:ActionResult = await actDef.run(g, namedOpts, action.positionalOpts)
        } catch(e) {
            if(e instanceof ActionResult) {
                actionResult = e
                err = true
            } else {
                throw e
            }
        }

        if(err) {
            if(actionResult.output !== undefined) {
                print(actionResult.output, chalk.red.bold(action.name + ': '))
            }
        } else {
            if(actionResult.output !== undefined) {
                print(actionResult.output, chalk.bold(action.name + ': '))
            }
        }

        if(actionResult.outcome === Outcome.Abort) {
            aborted = true
            break
        }
        if(actionResult.outcome === Outcome.ShowHelp) {
            help()
            break
        }

        function help() {
            print(group([
                text(def2usage(actDef).trim()),
                spacer(),
                actDef.description ? text(actDef.description) : spacer(),
                spacer(),
                actDef.help ? text(actDef.help) : spacer()
            ]))
            aborted = true
        }
    }

    if(aborted) {
        process.exitCode = 1
    } else {
        switch(output) {
            case 'summary':
                summarize(g)
                break
            case 'sbol1':
                return new SBOL1GraphView(g).serializeXML()
            case 'sbol2':
                return new SBOL2GraphView(g).serializeXML()
            case 'sbol3':
                return new SBOL3GraphView(g).serializeXML()
            case 'fasta':
                print(text(chalk.red('FASTA output not yet supported')))
                break
            case 'genbank':
                print(text(chalk.red('GenBank output not yet supported')))
                break
            default:
                print(text(chalk.red('Unknown output type: ' + output)))
                process.exitCode = 2
                break
        }
    }
}


function help() {
   print(
       text(
        helptext
                .replace(/\*\*(.*)\*\*/g, (w, str:string) => chalk.white.underline.bold(str.toUpperCase()))
                .replace(/\*(.*)\*/g, (w, str:string) => chalk.white.bold(str))
       )
   )
}