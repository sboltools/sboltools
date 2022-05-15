
import OutputNode from "../output/OutputNode";
import OutputNodeTree from "../output/OutputNodeTree";
import { group } from "../output/output";
import { SBOL1GraphView, S1DnaComponent, S1DnaSequence, SBOL3GraphView, S3Component, S3SubComponent } from "sboljs";

export function componentTree(gv:SBOL3GraphView):OutputNode { 

    let roots = gv.components

    return group(roots.map(componentToNode))

    function componentToNode(c:S3Component) {
        return new OutputNodeTree(
            c.displayName || 'c?',
            { 'foo': 'bar' },
            c.subComponents.map(subComponentToNode)
        )
    }

    function subComponentToNode(c:S3SubComponent) {
        return new OutputNodeTree(
            c.displayName || 'sc?',
            { 'foo': 'bar' },
            []
        )
    }
}
