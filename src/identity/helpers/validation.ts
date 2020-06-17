import ActionResult from "../../actions/ActionResult";
import { text, spacer, jsonTree, group, header, indent } from "../../output/output";
import { trace } from "../../output/print";

export function validateDisplayId(displayId:string) {

    if(displayId.length === 0) {
        throw new ActionResult(true,
            text(`Empty displayId`)
        )
    }

    if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(displayId)) {
        throw new ActionResult(true,
            text(`displayId must start with a letter or underscore and be composed of only alphanumeric and underscore characters`)
        )
    }

}


export function validateNamespace(namespace:string, debug:any) {

    if(namespace.length === 0) {

        trace(group([
            text('Namespace validation debug output:'),
            spacer(),
            indent([
                jsonTree(debug)
            ])
        ]))

        throw new ActionResult(true, group([
            text(`Empty namespace`)
        ]))
    }

    if(namespace[namespace.length - 1] !== '/' && namespace[namespace.length - 1] !== '#') {
        throw new ActionResult(true,
            text(`Namespace ${namespace} does not look valid: should end in / or #`)
        )
    }
}


export function validateNamespaceIsPrefix(ns:string, uri:string) {
    if(uri.indexOf(ns) !== 0) {
        throw new ActionResult(true,
            text(`Specified namespace ${ns} is not a prefix of identity URI ${uri}`)
        )
    }
}
