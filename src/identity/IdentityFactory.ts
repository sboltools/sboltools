import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { Graph } from "sbolgraph"
import Identity from "./Identity"

export default abstract class IdentityFactory {

    abstract from_namespace_and_identity(
        g:Graph, namespace:string, identity:string, version?:string):Identity

    abstract from_identity(
        g:Graph, identity:string, version?:string):Identity

    abstract child_from_namespace_context_displayId(
        g:Graph, namespace:string, context:string, displayId:string, version?:string):Identity

    abstract child_from_context_displayId(
        g:Graph, context:string, displayId:string, version?:string):Identity

    abstract toplevel_from_namespace_displayId(
        g:Graph, namespace:string, displayId:string, version?:string):Identity

    abstract toplevel_from_displayId(
        g:Graph, displayId:string, version?:string):Identity


}
