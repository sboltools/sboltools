

import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import OptTerm, { TermType } from "../opt/OptTerm"
import Context from "../../Context"
import OptIdentity from "../opt/OptIdentity"
import createComponentAction from "./create-component"
import remapOpts from "../helpers/remap-opts"

let dnaAction:ActionDef = {
    name: 'dna',
    description: 'Alias for `component --type DNA`; creates a DNA component',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'role',
            type: OptTerm
        }
    ],
    positionalOpts: [  
    ],
    run: dna
}

export default dnaAction

async function dna(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let newOpts = remapOpts(dnaAction, createComponentAction, namedOpts, {
        type: 'DNA'
    })

    return createComponentAction.run(ctx, newOpts, positionalOpts)
}


