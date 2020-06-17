
import Node from "./OutputNode";
import OutputNodeTree from "./OutputNodeTree";
import OutputNodeText from "./OutputNodeText";
import OutputNodeSpacer from "./OutputNodeSpacer";
import OutputNodeHeader from "./OutputNodeHeader";
import { applyStyles } from "../applyStyles";
import OutputNodeGroup from "./OutputNodeGroup";
import OutputNodeIndent from "./OutputNodeIndent";
import OutputNodeTabulated from "./OutputNodeTabulated";
import OutputNodeJSONTree from "./OutputNodeJSONTree";

import colorizeJSON = require('json-colorizer')

let INDENT_SIZE = 4

export default function tostring(indent:number, node:Node):string {

    let lastWasSpace = false

    let out:string[] = []
    printNode(node, indent)
    out.push('')

    return out.join('\n')

    function printNode(node:Node, depth:number) {

        if(node instanceof OutputNodeGroup) {
            printGroupNode(node, depth)
            return
        } else if(node instanceof OutputNodeTree) {
            printTreeNode(node, depth, depth)
            return
        } else if(node instanceof OutputNodeText) {
            printTextNode(node, depth)
            return
        } else if(node instanceof OutputNodeSpacer) {
            printSpacerNode(node, depth)
            return
        } else if(node instanceof OutputNodeHeader) {
            printHeaderNode(node, depth)
            return
        } else if(node instanceof OutputNodeIndent) {
            printIndentNode(node, depth)
            return
        } else if(node instanceof OutputNodeTabulated) {
            printTabulatedNode(node, depth)
            return
        } else if(node instanceof OutputNodeJSONTree) {
            printJSONTreeNode(node, depth)
            return
        } else {
            throw new Error('unknown node type >>' + JSON.stringify(node) + '<<')
        }
    }

    function printGroupNode(node:OutputNodeGroup, depth:number) {

        for(let child of node.children) {
            printNode(child, depth)
        }

    }

    function printTextNode(node:OutputNodeText, depth:number) {

        lastWasSpace = false

        let indentstr = ' '.repeat(depth * INDENT_SIZE) 

        out.push(indentstr + applyStyles(node.text, node.style))

        for(let child of node.children) {
            printNode(child, depth + 1)
        }

    }

    function printTreeNode(node:OutputNodeTree, rootDepth:number, depth:number) {

        lastWasSpace = false

        let indentstr = ' '.repeat(depth * INDENT_SIZE) 

        let branch = depth > rootDepth ? '┗ ' : ''

        out.push(indentstr + branch + node.text)

        for(let child of node.children) {

            if(! (child instanceof OutputNodeTree)) {
                throw new Error('tree child not tree node')
            }

            printTreeNode(child, rootDepth, depth + 1)
        }

    }

    function printSpacerNode(node:OutputNodeSpacer, depth:number) {

        if(lastWasSpace)
            return

        lastWasSpace = true

        let indentstr = ' '.repeat(depth * INDENT_SIZE) 

        out.push(indentstr)

    }

    function printHeaderNode(node:OutputNodeHeader, depth:number) {

        lastWasSpace = false

        let indentstr = ' '.repeat(depth * INDENT_SIZE) 

        out.push(indentstr + applyStyles(node.title, node.style))

        for(let child of node.children) {
            printNode(child, depth + 1)
        }

    }

    function printIndentNode(node:OutputNodeGroup, depth:number) {

        for(let child of node.children) {
            printNode(child, depth + 1)
        }

    }

    function printTabulatedNode(node:OutputNodeTabulated, depth:number) {

        let indentstr = ' '.repeat(depth * INDENT_SIZE) 

        let cols = 0

        for(let row of node.rows) {
            cols = Math.max(cols, row.length)
        }

        let widths:number[] = []

        for(let i = 0; i < cols; ++ i) {
            widths.push(0)
        }

        for(let row of node.rows) {
            for (let i = 0; i < cols; ++i) {
                widths[i] = Math.max(widths[i], row[i].length)
            }
        }

        for(let i = 0; i < cols; ++ i) {
            widths[i] = widths[i] + 7
        }

        for(let row of node.rows) {
            
            let outRow = ''

            for(let c = 0; c < row.length; ++ c) {
                
                let outCol = row[c]

                while(outCol.length < widths[c]) {
                    outCol += ' '
                }

                outRow += outCol
            }

            out.push(indentstr + outRow)
        }


    }

    function printJSONTreeNode(node:OutputNodeJSONTree, depth:number) {

        let indentstr = ' '.repeat(depth * INDENT_SIZE) 

        // ensure undefined properties get serialized (as null)
        let replace = (k, v) => v === undefined ? null : v

        let json = colorizeJSON(
            JSON.stringify(node.obj, replace, 2)
        )

        for(let line of json.split('\n')) {
            out.push(indentstr + line)
        }

    }
}
