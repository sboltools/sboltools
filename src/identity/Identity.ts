import { Graph, SBOLImporter, triple, SBOL1GraphView, S1DnaComponent, S1Collection, S2Identified, SBOL2GraphView, SBOL3GraphView, S3Identified } from "sbolgraph"
import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import joinURIFragments from "../util/join-uri-fragments"
import { Predicates, Types } from "bioterms"
import { S1Facade } from "sbolgraph"
import ActionResult from "../actions/ActionResult"
import { text } from "../output/output"
import IdentityFactorySBOL1 from "./IdentityFactorySBOL1"
import IdentityFactorySBOL2 from "./IdentityFactorySBOL2"
import IdentityFactorySBOL3 from "./IdentityFactorySBOL3"
import { identityErrorGeneric } from "./helpers/errors"
import { validateNamespace, validateDisplayId, validateNamespaceIsPrefix } from "./helpers/validation"
import { trace } from "../output/print"

export default class Identity {

    constructor(
        public sbolVersion:SBOLVersion,
        public namespace:string,
        public displayId:string,
        public version:string|undefined,
        public parentURI:string|undefined,
        public uri:string
    ) {

        // simple validation common to all SBOL versions

        validateNamespace(namespace, { sbolVersion, displayId, version, parentURI, uri})
        validateDisplayId(displayId)
        validateNamespaceIsPrefix(namespace, uri)
    }


    static from_identity(
        sbolVersion:SBOLVersion, g:Graph, identity:string, version?:string):Identity {

        trace(text(`from_identity: Constructing identity from identity ${identity}, version ${version}`))

        return factory(sbolVersion).from_identity(g, identity, version)
    }

    static from_namespace_and_identity(
        sbolVersion:SBOLVersion, g:Graph, namespace:string, identity:string, version?:string):Identity {

        trace(text(`from_namespace_and_identity: Constructing identity from namespace ${namespace}, identity ${identity}, version ${version}`))

        return factory(sbolVersion).from_namespace_and_identity(g, namespace, identity, version)
    }

    static child_from_namespace_context_displayId(
        sbolVersion:SBOLVersion, g:Graph, namespace:string, context:string, displayId:string, version?:string):Identity {

        trace(text(`child_from_namespace_context_identity: Constructing identity from namespace ${namespace}, context ${context}, displayId ${displayId}, version ${version}`))

        return factory(sbolVersion).child_from_namespace_context_displayId(g, namespace, context, displayId, version)
    }

    static toplevel_from_namespace_displayId(
        sbolVersion:SBOLVersion, g:Graph, namespace:string, displayId:string, version?:string):Identity {

        trace(text(`toplevel_from_namespace_displayId: Constructing identity from namespace ${namespace}, displayId ${displayId}`))

        return factory(sbolVersion).toplevel_from_namespace_displayId(g, namespace, displayId, version)
    }

    static child_from_context_displayId(
        sbolVersion:SBOLVersion, g:Graph, context:string, displayId:string, version?:string):Identity {

        trace(text(`child_from_namespace_displayId: Constructing identity from context ${context}, displayId ${displayId}, version ${version}`))

        return factory(sbolVersion).child_from_context_displayId(g, context, displayId, version)
    }

    static toplevel_from_displayId(
        sbolVersion:SBOLVersion, g:Graph, displayId:string, version?:string):Identity {

        trace(text(`toplevel_from_displayId: Constructing identity from displayId ${displayId}, version ${version}`))

        return factory(sbolVersion).toplevel_from_displayId(g, displayId, version)
    }
}

function factory(sbolVersion:SBOLVersion)  {
    switch (sbolVersion) {
        case SBOLVersion.SBOL1:
            return new IdentityFactorySBOL1()
        case SBOLVersion.SBOL2:
            return new IdentityFactorySBOL2()
        case SBOLVersion.SBOL3:
            return new IdentityFactorySBOL3()
        default:
            throw new ActionResult(true, text(`Unknown SBOL version`))
    }
}

