import Opt from "./Opt";
import { triple, Graph } from "sbolgraph";
import ActionDef, { OptDef } from "../ActionDef";
import { ArgvOptionSet } from "../../parse-argv";

export default class Opt1BasedInt extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }

    getInt(g:Graph):number {
        let s = this.argv.getString(this.optDef.name, '')
        let n = parseInt(s)

        if(n < 1) {
            throw new Error('1 based int must be >= 1')
        }

        return n
    }

}
