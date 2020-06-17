import OutputNode from "./OutputNode"

export default class OutputNodeTabulated extends OutputNode {

    constructor(public rows:string[][]) {
        super()
    }

}
