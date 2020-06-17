

export default abstract class OutputNode {
    children:OutputNode[]

    constructor(children?:OutputNode[]) {
        this.children = children || []
    }
}

