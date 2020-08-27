
import sboltools from '../../src/sboltools'
import stringArgv from 'string-argv'
import { beginCaptureOutput, endCaptureOutput, CapturedNode } from '../../src/output/print'
import chalk = require('chalk')

export default async function run(argv:string):Promise<{ result:string|undefined, log:CapturedNode[] }> {

    beginCaptureOutput()

    let result = await sboltools(stringArgv(argv))
    let log = endCaptureOutput()

    return { result, log }
}
