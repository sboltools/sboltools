
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph } from "rdfoo"
import { SBOLConverter, SBOL1GraphView, SBOL2GraphView, SBOL3GraphView } from "sbolgraph"
import { dnaComponentTree } from "../sbol1/dnaComponentTree"
import { componentTree } from "../sbol3/componentTree"
import { cdTree } from "../sbol2/cdTree"
import OutputNode from "../output/OutputNode"
import ActionResult from "./ActionResult"
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"
import Context from "../Context"

let componentsAction:ActionDef = {
    name: 'components',
    category: 'other',
    namedOpts: [
    ],
    positionalOpts: [
    ],
    run: components
}

export default componentsAction

async function components(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    let output:OutputNode[] = []


    let g1 = new SBOL1GraphView(g)

    if(g1.dnaComponents.length > 0) {
        output.push(group([
            header('SBOL1 DnaComponents'),
            spacer(),
            dnaComponentTree(g1),
            spacer()
        ]))
    }

    let g2 = new SBOL2GraphView(g)

    if(g2.componentDefinitions.length > 0) {
        output.push(group([
            header('SBOL2 ComponentDefinitions'),
            spacer(),
            cdTree(g2),
            spacer()
        ]))
    }

    if(g2.moduleDefinitions.length > 0) {
        output.push(group([
            header('SBOL2 ModuleDefinitions'),
            spacer(),
            cdTree(g2),
            spacer()
        ]))
    }
    
    let g3 = new SBOL3GraphView(g)

    if(g3.components.length > 0) {
        output.push(group([
            header('SBOL3 Components'),
            spacer(),
            componentTree(new SBOL3GraphView(g)),
            spacer()
        ]))
    }

    return new ActionResult(group(output))
}

