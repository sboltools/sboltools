
import ActionDef, { OptDef } from "../ActionDef";
import { ArgvOptionSet } from "../../parse-argv";

export default abstract class Opt {
    constructor(public actDef:ActionDef, public optDef: OptDef, public argv:ArgvOptionSet) {
    }
}
