import OutputNode from "./OutputNode";
import tostring from "./tostring";
import chalk = require("chalk");

let traceOn = false

let captureOutput = false
// let captured:string[] = []
let captured:CapturedNode[] = []

export interface CapturedNode {
    type:'print'|'trace'
    node:OutputNode
}

export function print(node:OutputNode, prefix?:string) {

    if(captureOutput) {
        captured.push({ type: 'print', node: node })
        return
    }

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

    if(captureOutput) {
        captured.push({ type: 'trace', node: node })
        return
    }

    let out = tostring(0, node)
    out = out.trim().split('\n').map(line => '[trace] ' + line).join('\n')
    out = chalk.dim(out) + '\n'

    printStderr(chalk.dim(out))
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
    return captured
}

export function printStderr(out:string) {

    if(typeof window !== undefined && typeof process === undefined) {
        // browser
        window['sboltools'].print(out)
    } else {
    // if (captureOutput) {
    //     captured.push(out)
    // } else {
        process.stderr.write(out)
    // }
        }
}

