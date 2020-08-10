
import tests_graphops from './graph-ops'
import tests_sbol1 from './sbol1'
import tests_sbol2 from './sbol2'
import tests_sbol3 from './sbol3'
import Test from './Test'
import { text, indent, spacer, group, multiline } from '../src/output/output'
import { print, beginCaptureOutput, endCaptureOutput, CapturedNode } from '../src/output/print'
import sboltools from '../src/sboltools'
import stringArgv from 'string-argv'
import { fail } from 'yargs'
import tostring from '../src/output/tostring'
import chalk = require('chalk')
import glob = require('glob-promise')
import { globalAgent } from 'http'
import OutputNode from '../src/output/OutputNode'

let tests:Test[] = [
    //...tests_graphops
    //...tests_sbol1,
    ...tests_sbol2,
    //...tests_sbol3
]

runTests()

async function runTests() {

    let passes:string[] = []
    let fails:string[] = []

    for(let test of tests) {

        let pass = true

        if(test.glob) {

            let files:string[] = []

            for(let g of test.glob) {
                files = files.concat(await glob(g))
            }

            let n:OutputNode[] = []

            n.push(text('Glob ' + test.glob))
            n.push(text(files.length + ' file(s)'))

            for(let file of files) {

                let c = (test.command as any)(file) 

                n.push(text('===== TEST: ' + test.id + ': ' + test.name + ' ' + file, 'white bold'))
                n.push(text('      command: ' + c, 'white bold'))

                await run(test, test.id + '#' + file.split('/').pop(), c)

            }

        } else {

            print(text('===== TEST: ' + test.id + ': ' + test.name, 'white bold'))
            print(text('      command: ' + test.command, 'white bold'))

            await run(test, test.id, test.command)
        }

    }

    print(group([
        text(`===== PASSING:`, 'white bold'),
        spacer(),
        indent(passes.map(t => text(t, 'green'))),
        spacer(),
        text(`===== FAILING:`, 'white bold'),
        spacer(),
        indent(fails.map(t => text(t, 'red'))),
        spacer()
    ]))

    print(text(`===== SUMMARY: ${passes.length} test(s) passed, ${fails.length} test(s) failed`, 'white bold'))

    if(fails.length > 0) {
        process.exitCode = 1
    }





    async function run(test, id, command) {

        let pass = true

        beginCaptureOutput()

        // try {
            var output = await sboltools(['node', 'just.a.unit.test'].concat(stringArgv(command)))
        // } catch(e) {
        //     print(indent([spacer(),text('--- ' + test.id + ' failed at execution stage: ' + e, 'red bold')]))
        //     pass = false
        // }

        let captured:CapturedNode[] = endCaptureOutput()

        print(
            indent(
                captured.map(node => {
                    if(node.type === 'trace') {
                        let t = tostring(0, node.node)
                        t = t.trim().split('\n').map(line => '[trace] ' + line).join('\n')
                        t = chalk.dim(t)
                        return multiline(t)
                    } else {
                        return node.node
                    }
                })
            )
        )



        if(output) {
            let lines = output.trim().split('\n').map((line) => text(line))
            print(indent(lines))
        }

        try {
            await test.validate(output)
        } catch(e) {
            print(indent([spacer(),text('--- ' + id + ' failed at validation stage: ' + e.stack, 'red bold')]))
            pass = false
        }

        if(pass) {
            print(spacer())
            print(text('✅ Passed: ' + id, 'green bold'))
            print(spacer())
            passes.push(id)
        } else {
            print(spacer())
            print(text('❌ Failed: ' + id, 'red bold'))
            print(spacer())
            fails.push(id)
        }
        
        return pass
    }







}





