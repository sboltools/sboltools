import OutputNode from "../output/OutputNode";

export default class ActionResult {
    constructor(public abort:boolean, public output?:OutputNode) {
    }
}