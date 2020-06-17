import OutputNode from "./OutputNode";
import tostring from "./tostring";
import chalk = require("chalk");

let traceOn = false

let captureOutput = false
let captured:string[] = []

export function print(node:OutputNode, prefix?:string) {
    if(prefix) {
        let out = tostring(0, node)
        out = out.trim().split('\n').map(line => prefix + line).join('\n')
        out = out + '\n'
        printStderr(out + '\n')
    } else {
        printStderr(tostring(0, node))
    }
}

export function trace(node:OutputNode) {

    if(!traceOn)
        return

    let out = tostring(0, node)
    out = out.trim().split('\n').map(line => '[trace] ' + line).join('\n')
    out = chalk.dim(out) + '\n'

    printStderr(chalk.dim(out) + '\n')
}

export function enableTrace() {
    traceOn = true
}

export function beginCaptureOutput() {
    captureOutput = true
    captured = []
}

export function endCaptureOutput() {
    captureOutput = false
    return captured.join('')
}

export function printStderr(out:string) {
    if (captureOutput) {
        captured.push(out)
    } else {
        process.stderr.write(out)
    }
}

