
import { Graph } from "rdfoo";
import Identity from "./Identity";
import ActionResult, { actionResultAbort } from "../actions/ActionResult";
import { text } from "../output/output";
import IdentityFactory from "./IdentityFactory";
import { SBOLVersion } from "../util/get-sbol-version-from-graph";
import joinURIFragments from "../util/join-uri-fragments";
import { identityErrorGeneric } from "./helpers/errors";

export default class IdentityFactorySBOL3 extends IdentityFactory {
    from_namespace_and_identity(g: Graph, namespace: string, identity: string, version?: string | undefined): Identity {
        throw new Error("Method not implemented.");
    }
    from_identity(g: Graph, identity: string, version?: string | undefined): Identity {
        throw new Error("Method not implemented.");
    }
    child_from_namespace_context_displayId(g: Graph, namespace: string, context: string, displayId: string, version?: string | undefined): Identity {
        throw new Error("Method not implemented.");
    }
    child_from_context_displayId(g: Graph, context: string, displayId: string, version?: string | undefined): Identity {
        throw new Error("Method not implemented.");
    }
    toplevel_from_namespace_displayId(g: Graph, namespace: string, displayId: string, version?: string | undefined): Identity {
        throw new Error("Method not implemented.");
    }
    toplevel_from_displayId(g: Graph, displayId: string, version?: string | undefined): Identity {
        throw new Error("Method not implemented.");
    }

}


function sbol3VersionError() {
    return actionResultAbort(text(`--version option is not supported for SBOL3.
    (7.3.) SBOL 3.x does not specify an explicit versioning scheme. Rather it is left for experimentation across different 2 tools.
    This allows version information to be included in the root (e.g., GitHub style: “igem/HEAD/”), collection 3 structure (e.g., “promoters/constitutive/2/”),
    in tool-specific conventions on displayId (e.g., “BBa_J23101_v2”) or 4 in information outside of the
    URI (e.g., by attaching prov:wasRevisionOf properties).`))
    }