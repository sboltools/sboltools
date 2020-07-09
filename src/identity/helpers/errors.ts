import ActionResult, { actionResultAbort } from "../../actions/ActionResult"
import { text } from "../../output/output"


export function identityErrorGeneric(): ActionResult {
    return actionResultAbort(
        text(`Unable to construct an identity using the supplied parameters`)
    )
}


export function identityErrorUnguessableNamespace(namespaces:string[]): ActionResult {
    if(namespaces.length > 0) {
        return actionResultAbort(
            text(`No namespace was specified, and cannot default to a single existing namespace as there are ${namespaces.length} different namespaces in use in the knowledge graph: ${namespaces.join(', ')}`)
        )
    } else {
        return actionResultAbort(
            text(`No namespace was specified, and cannot default to a single existing namespace as the knowledge graph appears to be empty`)
        )
    }
}

export function identityErrorChildIdentityMissingContext():ActionResult {
    return actionResultAbort(
        text(`The combination of identity parameters used indicates a child object, but no context was provided to indicate the parent`)
    )
}

export function identityErrorEmptyChain():ActionResult {
    return actionResultAbort(
        text(`Empty identity chain`)
    )
}
