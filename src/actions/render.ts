
import { text, group, spacer, header, indent, conditional } from "../output/output"
import { Graph, serialize } from "rdfoo"
import fetch = require('node-fetch')
import ActionResult from "./ActionResult"

import fs = require('fs')
import ActionDef from "./ActionDef"
import Opt from "./opt/Opt"

let renderAction:ActionDef = {
    name: 'synbiocad-render',
    category: 'other',
    namedOpts: [
    ],
    positionalOpts: [
    ],
    run: render
}

export default renderAction

async function render(g:Graph,  namedOpts:Opt[], positionalOpts:string[]):Promise<ActionResult> {

    // let format = opts.filter(o => o.name === 'format')[0]?.value
    // let filename = opts.filter(o => o.name === 'filename')[0]?.value

    // //let validFormats = ['svg', 'png', 'pptx']
    // let validFormats = ['svg']

    // if(validFormats.indexOf(format as string) === -1) {
    //     return new ActionResult(true, text('render: --format must be one of: ' + validFormats))
    // }
    
    // if(!filename) {
    //     return new ActionResult(true, text('render: please specify a --filename'))
    // }

    // let r = await fetch(`https://api.biocad.io/render/${format}`, {
    //     method: 'POST',
    //     headers: {
    //         'content-type': 'application/rdf+xml'
    //     },
    //     body: serialize(g, new Map(), () => false)
    // })

    // let body = await r.text()

    // fs.writeFileSync(filename, body)

    // return new ActionResult(false, text(`Rendered ${filename}`))

    return new ActionResult(group([]))

}

