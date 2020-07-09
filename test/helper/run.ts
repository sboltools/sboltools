
import sboltools from '../../src/sboltools'
import stringArgv from 'string-argv'
import { beginCaptureOutput, endCaptureOutput, CapturedNode } from '../../src/output/print'
import chalk = require('chalk')

export default async function run(argv:string):Promise<{ result:string|undefined, log:CapturedNode[] }> {

    console.log(chalk.bold('===== TEST: Running: ') + 'sbol ' + argv)

    beginCaptureOutput()

    let result = await sboltools(stringArgv(argv))
    let log = endCaptureOutput()

    console.log(chalk.bold('===== TEST: Output for: ') + 'sbol ' + argv)
    console.log(result)

    console.log(chalk.bold('===== TEST: Log for: ') + 'sbol ' + argv)
    console.log(log)

    return { result, log }
}
