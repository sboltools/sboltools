import { Graph } from "rdfoo";
import Identity from "./Identity";
import ActionResult from "../actions/ActionResult";
import { text } from "../output/output";
import IdentityFactory from "./IdentityFactory";
import { SBOLVersion } from "../util/get-sbol-version-from-graph";
import { identityErrorGeneric } from "./helpers/errors";

export default class IdentityFactorySBOL2 extends IdentityFactory {
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


