

import { SBOL3GraphView, Graph, SBOL1GraphView, SBOL2GraphView } from 'sboljs'

import { print, enableTrace, trace } from './output/print'

import actions from './actions'
import parseArgv, { ArgvNamedOption, ArgvOptionSet } from './parse-argv'

import helptext from './help'
import jsonHelp from './help_json'
import summarize from './summarize'
import ActionResult, { Outcome } from './actions/ActionResult'
import chalk = require('chalk')
import { text, spacer, group } from './output/output'
import ActionDef, { def2usage } from './actions/ActionDef'
import Opt from './actions/opt/Opt'
import Context from './Context'
import graphToSboltoolsCmd from './graphToSboltoolsCmd'
import { getSBOLVersionFromGraph, SBOLVersion } from './util/get-sbol-version-from-graph'

var sqparse = require('shell-quote').parse;

export default async function sboltools(args:string[]|string):Promise<string|undefined> {

    if(typeof args === 'string') {
        args = sqparse(args)
    }

    // console.dir(args)

    let argv = parseArgv(args as string[])

    // console.dir(argv)


    if(argv.actions.length === 0 ||
            (argv.globalOpts.getFlag('help') || argv.globalOpts.getFlag('h'))) {

		if(argv.globalOpts.getFlag('json')) {
			help_json()
		} else {
			help()
		}
        return

    }

    if(argv.globalOpts.getFlag('trace')) {
        enableTrace()
        trace(text('sboltools trace output is enabled'))
    }

    let output = argv.globalOpts.getString('output', 'summary')

    let ctx = new Context()


    let aborted = false

    for(let action of argv.actions) {

        let actDef:ActionDef = actions.filter(a => a.name === action.name)[0]

        if(actDef === undefined) {
            print(text('Unknown action: ' + action.name))
            aborted = true
            break
        }

        if(action.namedOpts.getFlag('help') || action.namedOpts.getFlag('h')) {
            help()
            break
        }

        let namedOpts = actDef.namedOpts.map(optDef => new optDef.type(actDef, optDef, action.namedOpts))

        // todo hacky af
        let positionalOpts = actDef.positionalOpts.map((optDef, i) => {
		if(action.positionalOpts[i]) {
			return new optDef.type(actDef, optDef, new ArgvOptionSet([
				new ArgvNamedOption(optDef.name, action.positionalOpts[i])
			]))
		} else {
			return undefined
		}
	})

        // console.dir('po')
        // console.dir(positionalOpts)

        let err = false

        try {
            trace(text(`Begin action: ${actDef.name}`))
            var actionResult:ActionResult = await actDef.run(ctx, namedOpts as Opt[], positionalOpts as Opt[])
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
                summarize(ctx.getCurrentGraph())
                break
            case 'sbol':

                let detectedVersion = getSBOLVersionFromGraph(ctx.getCurrentGraph())

                switch(detectedVersion) {
                    case SBOLVersion.SBOL1:
                        return new SBOL1GraphView(ctx.getCurrentGraph()).serializeXML()
                    case SBOLVersion.SBOL2:
                        return new SBOL2GraphView(ctx.getCurrentGraph()).serializeXML()
                    case SBOLVersion.SBOL3:
                        return new SBOL3GraphView(ctx.getCurrentGraph()).serializeXML()
                    case SBOLVersion.Mixed:
                    default:
                        return new SBOL3GraphView(ctx.getCurrentGraph()).serializeXML()
                }

            case 'sbol1':
                return new SBOL1GraphView(ctx.getCurrentGraph()).serializeXML()
            case 'sbol2':
                return new SBOL2GraphView(ctx.getCurrentGraph()).serializeXML()
            case 'sbol3':
                return new SBOL3GraphView(ctx.getCurrentGraph()).serializeXML()
            case 'fasta':
                print(text(chalk.red('FASTA output not yet supported')))
                break
            case 'genbank':
                print(text(chalk.red('GenBank output not yet supported')))
                break
            case 'sboltools':
                return graphToSboltoolsCmd(ctx.getCurrentGraph());
            case 'none':
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
                .replace('%actions%', actions.map(a => '    ' + a.name).join('\n'))
       )
   )
}


function help_json() {
   console.log(
	       jsonHelp()
       )
}


