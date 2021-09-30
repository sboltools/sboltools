
import OutputNode from "../output/OutputNode";
import OutputNodeTree from "../output/OutputNodeTree";
import { group } from "../output/output";
import { SBOL1GraphView, S1DnaComponent, S1DnaSequence } from "sbolgraph";
import { Predicates } from "bioterms";

export function dnaComponentTree(gv:SBOL1GraphView):OutputNode { 

    let roots = gv.rootDnaComponents

    return group(roots.map(dnaComponentToNode))

    function dnaComponentToNode(c:S1DnaComponent) {

        // console.log(gv.graph.match(c.uri, null, null))
        // console.log(c.getUriProperties(Predicates.SBOL1.subComponent).length)

        return new OutputNodeTree(
            c.name || c.displayId || c.subject.value,
            { 'foo': 'bar' },
            c.subComponents.map(dnaComponentToNode)
                .concat(
                    [c.dnaSequence].filter((seq) => seq !== undefined).map(dnaSequenceToNode)
                )
        )
    }

    function dnaSequenceToNode(c:S1DnaSequence) {
        return new OutputNodeTree(
            c.name || c.subject.value,
            { 'foo': 'bar' },
            []
        )
    }
}
