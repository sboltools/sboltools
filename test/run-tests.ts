
import tests_sbol1 from './sbol1'
import tests_sbol2 from './sbol2'
import Test from './Test'
import { text, indent, spacer, group } from '../src/output/output'
import { print, beginCaptureOutput, endCaptureOutput } from '../src/output/print'
import sboltools from '../src/sboltools'
import stringArgv from 'string-argv'
import { fail } from 'yargs'

let tests:Test[] = [
    ...tests_sbol1,
    ...tests_sbol2
]

runTests()

async function runTests() {

    let passes:string[] = []
    let fails:string[] = []

    for(let test of tests) {

        print(text('===== TEST: ' + test.id + ': ' + test.name, 'white bold'))
        print(text('      command: ' + test.command, 'white bold'))

        beginCaptureOutput()

        let pass = true

        // try {
            var output = await sboltools(['node', 'just.a.unit.test'].concat(stringArgv(test.command)))
        // } catch(e) {
        //     print(indent([spacer(),text('--- ' + test.id + ' failed at execution stage: ' + e, 'red bold')]))
        //     pass = false
        // }

        let stderr = endCaptureOutput()

        let stderrLines = stderr.trim().split('\n').map((line) => text(line))
        print(indent(stderrLines))

        if(output) {
            let lines = output.trim().split('\n').map((line) => text(line))
            print(indent(lines))
        }

        try {
            await test.validate(output)
        } catch(e) {
            print(indent([spacer(),text('--- ' + test.id + ' failed at validation stage: ' + e.stack, 'red bold')]))
            pass = false
        }

        if(pass) {
            print(spacer())
            print(text('✅ Passed: ' + test.id, 'green bold'))
            print(spacer())
            passes.push(test.id)
        } else {
            print(spacer())
            print(text('❌ Failed: ' + test.id, 'red bold'))
            print(spacer())
            fails.push(test.id)
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

}





