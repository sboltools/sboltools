
import { S2ModuleDefinition, S2ModuleInstance, SBOL2GraphView, S2FunctionalComponent } from "sbolgraph";
import { glyphs } from "../glyphs";
import OutputNode from "../output/OutputNode";
import OutputNodeTree from "../output/OutputNodeTree";
import { group } from "../output/output";

export function mdTree(gv:SBOL2GraphView):OutputNode { 

    let roots = gv.rootModuleDefinitions

    return group(roots.map(mdToNode))

    function mdToNode(md:S2ModuleDefinition) {
        return new OutputNodeTree(
            'ModuleDefinition ' + md.displayName,
            { 'foo': 'bar' },
                md.modules.map(mToNode)
                    .concat(
                        md.functionalComponents.map(fcToNode)
                    )
        )
    }

    function mToNode(m:S2ModuleInstance) {

        if(roots.filter(r => r.subject.value === m.subject.value).length > 0) {
            // its a root
            return {
                text: 'ModuleDefinition --[definition]--> ' + m.definition.displayName,
                attribs: {},
                children: []
            }
        } else {
            return mdToNode(m.definition)
        }
    }

    function fcToNode(fc: S2FunctionalComponent) {
        let node = new OutputNodeTree(
             fc.definition.displayName || '??fc',
             {},
             []
        )
        return node
    }



}
