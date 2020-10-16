import { Types } from "bioterms";

export default function isTopLevelType(type:string) {
    return [
        Types.SBOL1.DnaComponent,
        Types.SBOL1.Collection,
        Types.SBOL2.ComponentDefinition,
        Types.SBOL2.ModuleDefinition,
        Types.SBOL2.Sequence,
        Types.SBOL3.Component,
        Types.SBOL3.Sequence
    ].indexOf(type) !== -1
}
