
import { assert } from "console";
import { ArgvNamedOption, ArgvOptionSet } from "src/parse-argv";
import ActionDef, { OptDef } from "../ActionDef";
import Opt from "../opt/Opt";

export default function remapOpts(
    thisActDef:ActionDef,
    actDefToMapTo:ActionDef,
    opts:Opt[],
    newOptsToAdd:any):Opt[] {

    let newOpts:Opt[] = actDefToMapTo.namedOpts.map(newOptDef => {

        for(let n = 0; n < thisActDef.namedOpts.length; ++ n) {

            let curOptDef = thisActDef.namedOpts[n]

            if(curOptDef.name == newOptDef.name) {
                return new newOptDef.type(actDefToMapTo, newOptDef, opts[n].argv)
            } else {
                let newVal = newOptsToAdd[newOptDef.name]
                assert(newVal)

                let fakeArgv = new ArgvOptionSet([new ArgvNamedOption(newOptDef.name, newVal)])
                let newOpt = new newOptDef.type(actDefToMapTo, newOptDef, fakeArgv)

                return newOpt
            }
        }

        throw new Error('??')

    })

    return newOpts

}