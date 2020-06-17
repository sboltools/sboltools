
import { S2ComponentDefinition, S2ComponentInstance, SBOL2GraphView } from "sbolgraph";
import { glyphs } from "../glyphs";
import OutputNode from "../output/OutputNode";
import OutputNodeTree from "../output/OutputNodeTree";
import { group } from "../output/output";

export function cdTree(gv:SBOL2GraphView):OutputNode { 

    let roots = gv.structurallyRootComponentDefinitions

    return group(roots.map(cdToNode))

    function cdToNode(cd:S2ComponentDefinition) {
        return new OutputNodeTree(
            cd.displayName || '???',
            { 'foo': 'bar' },
            cd.components.map(cToNode)
        )
    }

    function cToNode(m:S2ComponentInstance) {

        if(roots.filter(r => r.uri === m.uri).length > 0) {
            // its a root
            return new OutputNodeTree(
                ' -> ' + m.definition.displayName,
                {},
                []
            )
        } else {
            return cdToNode(m.definition)
        }
    }



}
