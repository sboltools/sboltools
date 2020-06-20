import OutputNode from "../output/OutputNode";

export enum Outcome {
    Abort,
    ShowHelp,
    Continue
}

export default class ActionResult {
    constructor(public output?:OutputNode, public outcome?:Outcome) {
        if(outcome === undefined) {
            this.outcome = Outcome.Continue
        }
    }
}

export function actionResult(output?:OutputNode) {
    return new ActionResult(output, Outcome.Continue)
}

export function actionResultAbort(output?:OutputNode) {
    return new ActionResult(output, Outcome.Abort)
}

export function actionResultShowHelp(output?:OutputNode) {
    return new ActionResult(output, Outcome.ShowHelp)
}
