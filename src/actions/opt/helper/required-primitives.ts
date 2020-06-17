
import { ArgvOptionSet } from "../../../parse-argv"
import ActionResult from "../../../actions/ActionResult"
import { text } from "../../../output/output"

export function getRequiredString(opts:ArgvOptionSet, opt:string):string {
    let value = opts.getString(opt, '')
    if(value === '') {
        throw new ActionResult(true, text(`${this.actionName}: Missing required parameter --${opt}`))
    }
    return value
}

