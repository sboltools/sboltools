import OutputNodeHeader from "./OutputNodeHeader"
import OutputNodeSpacer from "./OutputNodeSpacer"
import OutputNodeText from "./OutputNodeText"
import OutputNode from "./OutputNode"
import OutputNodeTree from "./OutputNodeTree"
import OutputNodeGroup from "./OutputNodeGroup"
import OutputNodeIndent from "./OutputNodeIndent"
import OutputNodeTabulated from "./OutputNodeTabulated"
import OutputNodeJSONTree from "./OutputNodeJSONTree"
import OutputNodeMultiline from "./OutputNodeMultiline"

export function header(title, style?:string):OutputNode {
    return new OutputNodeHeader(title, style)
}

export function spacer():OutputNode {
    return new OutputNodeSpacer()
}

export function text(text:string, style?:string):OutputNode {
    return new OutputNodeText(text, style)
}

export function multiline(text:string, style?:string):OutputNode {
    return new OutputNodeMultiline(text, style)
}

export function treeNode(text:string, attribs:{[n: string]: string}, children:OutputNode[]):OutputNode {
    return new OutputNodeTree(text, attribs, children)
}

export function group(children:OutputNode[]):OutputNode {
    return new OutputNodeGroup(children)
}

export function indent(children:OutputNode[]):OutputNode {
    return new OutputNodeIndent(children)
}

export function conditional(cond:boolean, children:OutputNode[]):OutputNode {
    return new OutputNodeGroup(cond ? children : [])
}

export function tabulated(rows:string[][]):OutputNode {
    return new OutputNodeTabulated(rows)
}

export function jsonTree(obj:any):OutputNode {
    return new OutputNodeJSONTree(obj)
}


