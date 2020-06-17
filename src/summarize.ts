
import OutputNode from "./output/OutputNode"
import { Graph, identifyFiletype, Filetype } from "rdfoo"
import { text, group, spacer, header, indent, conditional } from "./output/output"
import { SBOL2GraphView, SBOL1GraphView, SBOL3GraphView } from "sbolgraph"
import { dnaComponentTree } from "./sbol1/dnaComponentTree"
import { mdTree } from "./sbol2/mdTree"
import { componentTree } from "./sbol3/componentTree"
import { ProvView } from "rdfoo-prov"
import { glyphs } from "./glyphs"
import fs = require('promise-fs')
import { fetch } from 'node-fetch'
import { cdTree } from "./sbol2/cdTree"
import { print } from './output/print'

export default async function summarize(g:Graph):Promise<void> {

    let out:OutputNode[] = []

    out.push(group([
        spacer(),
        header('Summary', 'bold underline caps'),
        spacer(),
        indent([
            summariseSBOL1(g),
            summariseSBOL2(g),
            summariseSBOL3(g),
            summariseProv(g)
        ]),
        spacer(),
        conditional(new SBOL1GraphView(g).topLevels.length > 0, [
            header('SBOL 1.x Overview', 'bold underline caps'),
            spacer(),
            indent([
                indent([
                    header('DnaComponent(s)'),
                    spacer(),
                    indent([
                        dnaComponentTree(new SBOL1GraphView(g))
                    ])
                ])
            ])
        ]),
        conditional(new SBOL2GraphView(g).topLevels.length > 0, [
            header('SBOL 2.x Overview', 'bold underline caps'),
            spacer(),
            indent([
                indent([
                    header('ModuleDefinition(s)'),
                    spacer(),
                    indent([
                        mdTree(new SBOL2GraphView(g))
                    ]),
                    spacer(),
                    header('ComponentDefinition(s)'),
                    spacer(),
                    indent([
                        cdTree(new SBOL2GraphView(g))
                    ])
                ])
            ])
        ]),
        conditional(new SBOL3GraphView(g).topLevels.length > 0, [
            header('SBOL 3.x Overview', 'bold underline caps'),
            spacer(),
            indent([
                indent([
                    header('Component(s)'),
                    spacer(),
                    indent([
                        componentTree(new SBOL3GraphView(g))
                    ])
                ])
            ])
        ])
    ]))

    print(group(out))
}

function summariseSBOL1(g:Graph):OutputNode {

    let v = new SBOL1GraphView(g)

    let any = v.topLevels.length > 0

    if(!any) {
        return group([
            text('No SBOL 1.x to output'),
            spacer()
        ])
    }
    
    return group([
        header('SBOL 1.x', 'bold underline white'),
        spacer(),
        indent([
            arraySummary(v.dnaComponents, 'DnaComponent'),
            arraySummary(v.dnaSequences, 'DnaSequence')
        ]),
        spacer()
    ])
}

function summariseSBOL2(g:Graph):OutputNode {

    let v = new SBOL2GraphView(g)

    let any = v.topLevels.length > 0

    if(!any) {
        return group([
            text('No SBOL 2.x to output'),
            spacer()
        ])
            
    }

    return group([
        text('SBOL 2.x:'),
        spacer(),
        indent([
            arraySummary(v.moduleDefinitions, 'ModuleDefinition'),
            arraySummary(v.componentDefinitions, 'ComponentDefinition')
        ]),
        spacer()
    ])
}


function summariseSBOL3(g:Graph):OutputNode {

    let v = new SBOL3GraphView(g)

    let any = v.topLevels.length > 0

    if(!any) {
        return group([
            text('No SBOL 3.x to output'),
            spacer()
        ])
            
    }

    return group([
        text('SBOL 3.x:'),
        spacer(),
        indent([
            arraySummary(v.components, 'Component')
        ]),
        spacer()
    ])
}

function summariseProv(g:Graph) {

    let v = new ProvView(g)


    return group([])
}

function arraySummary(arr:any[], name:string):OutputNode {

    let style = arr.length > 0 ? 'white' : 'gray'

    return text(`${arr.length} ${name}(s)`, style)
}