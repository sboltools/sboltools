import { SBOLVersion } from "../util/get-sbol-version-from-graph"
import { Graph } from "sbolgraph"
import Identity from "./Identity"

export enum Existence {
    // UltimatelyMeaningless,
    MustExist = 'MustExist',
    MayExist = 'MayExist',
    MustNotExist = 'MustNotExist'
}

export default abstract class IdentityFactory {

    abstract from_namespace_and_identity(
        existence:Existence, g:Graph, namespace:string, identity:string, version?:string):Identity

    abstract from_identity(
        existence:Existence, g:Graph, identity:string, version?:string):Identity

    abstract child_from_namespace_context_displayId(
        existence:Existence, g:Graph, namespace:string, context:string, displayId:string, version?:string):Identity

    abstract child_from_context_displayId(
        existence:Existence, g:Graph, context:string, displayId:string, version?:string):Identity

    abstract toplevel_from_namespace_displayId(
        existence:Existence, g:Graph, namespace:string, displayId:string, version?:string):Identity

    abstract toplevel_from_displayId(
        existence:Existence, g:Graph, displayId:string, version?:string):Identity


}
