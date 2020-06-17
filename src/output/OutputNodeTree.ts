import OutputNode from "./OutputNode"

export default class OutputNodeTree extends OutputNode {

    text:string
    attribs: { [name: string]: string }

    constructor(text:string, attribs:{[n: string]: string}, children:OutputNode[]) {
        super(children)
        this.text = text
        this.attribs = attribs
        this.children = children
    }

}
