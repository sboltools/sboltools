
import { ArgvOptionSet } from "../../../parse-argv"
import ActionResult, { Outcome } from "../../../actions/ActionResult"
import { text } from "../../../output/output"

export function getRequiredString(opts:ArgvOptionSet, opt:string):string {
    let value = opts.getString(opt, '')
    if(value === '') {
        throw new ActionResult(text(`${this.actionName}: Missing required parameter --${opt}`), Outcome.Abort)
    }
    return value
}

