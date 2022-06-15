


import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import OptTerm, { TermType } from "../opt/OptTerm"
import Context from "../../Context"
import OptIdentity from "../opt/OptIdentity"
import createComponentAction from "./create-component"
import remapOpts from "../helpers/remap-opts"

let proteinAction:ActionDef = {
    name: 'protein',
    description: 'Alias for `component --type Protein`; creates a Protein component',
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
    run: protein
}

export default proteinAction

async function protein(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let newOpts = remapOpts(dnaAction, createComponentAction, namedOpts, {
        type: 'Protein'
    })

    return createComponentAction.run(ctx, newOpts, positionalOpts)
}


