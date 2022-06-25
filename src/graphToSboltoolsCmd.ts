
import OutputNode from "./output/OutputNode"
import { Graph, identifyFiletype, Filetype } from "rdfoo"
import { text, group, spacer, header, indent, conditional } from "./output/output"
import { SBOL2GraphView, SBOL1GraphView, SBOL3GraphView, sbol3, S3Identified } from "sboljs"
import { dnaComponentTree } from "./sbol1/dnaComponentTree"
import { mdTree } from "./sbol2/mdTree"
import { componentTree } from "./sbol3/componentTree"
import { ProvView } from "rdfoo-prov"
import { glyphs } from "./glyphs"
import fs = require('promise-fs')
import { cdTree } from "./sbol2/cdTree"
import { print } from './output/print'
import { Types } from "bioterms"
import { TermType, termUriToShorthand } from "./vocab"
import tostring from "./output/tostring"

export default function graphToSboltoolsCmd(g:Graph):string {

    let out:OutputNode[] = []

    out.push(indent([
        text('sbol-version 3')
    ]))

    let curNamespace = ''

    for(let rootC of sbol3(g).rootComponents) {

        if(curNamespace !== rootC.namespace) {
            out.push(indent([
                text('namespace ' + rootC.namespace)
            ]))
            curNamespace = rootC.namespace
        }

        let componentSection:OutputNode[] = []

        for(let type of rootC.types) {
            componentSection.push(text('--type ' + termUriToShorthand(TermType.ComponentTypeSBOL3, type)))
        }

        let idchain = rootC.displayId

        out.push(
            indent([
                text('component ' + idchain),
                indent(componentSection)
            ])
        )
    }

	let lines = tostring(0,
		group([
			text('sbol --trace'),
			indent(out)
		])
	).trim().split('\n')

    let cmd = ''

	for(let n = 0; n < lines.length; ++ n) {
		if(n < lines.length - 1) {
            cmd += lines[n] + ' \\\n'
		} else {
			cmd += lines[n] + '\n'
		}
	}

    return cmd
}

function makeIdChain(id:S3Identified) {
    
}
