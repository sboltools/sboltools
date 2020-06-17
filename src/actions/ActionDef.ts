import ActionResult from "./ActionResult";
import { Graph } from "sbolgraph";
import Opt from "./opt/Opt";
import { ArgvOptionSet } from "../parse-argv";

export default interface ActionDef {
    name: string,
    description?: string,
    help?:string

    category:'local-conversion'|'vc'|'object-cd'|'rel-cd'|'seq-anno'|'other'
    opts: OptDef[],
    run: (g: Graph, opts: Opt[]) => Promise<ActionResult>
}

export interface OptDef {
    name:string
    type:{new (actDef:ActionDef, optDef:OptDef, argv:ArgvOptionSet): Opt }
    optional?:boolean
    refinements?:any
}

export function def2usage(def:ActionDef):string {

    let out = ''
    let indent = 0

    addLine(def.name)

    let doneOpts = new Set()

    // I like the --preposition-* opts like "for" and "within" to be before anything else in the help
    for(let forOpt of def.opts.filter(opt => opt.name.indexOf('for') === 0 || opt.name.indexOf('within') === 0)) {
        doneOpts.add(forOpt)
        addLine(descOpt(forOpt))
    }

    // then mandatory ones
    for(let opt of def.opts.filter(opt => !opt.optional)) {
        if(!doneOpts.has(opt)) {
            doneOpts.add(opt)
            addLine(descOpt(opt))
        }
    }

    // then everything else
    for(let opt of def.opts) {
        if(!doneOpts.has(opt)) {
            doneOpts.add(opt)
            addLine(descOpt(opt))
        }
    }

    return out

    function addLine(line) {
        out += ' '.repeat(indent) + line + '\n'
        indent += 4
    }

    function descOpt(opt:OptDef) {
        return [
            opt.optional === true ? '[' : '',
            opt.name.length > 0 ? '--' + opt.name : opt.name,
            ' ' + argType(opt),
            opt.optional === true ? ']' : '',
        ].join('')
    }

    function argType(opt:OptDef) {
        switch(opt.type.name) {
            case 'OptIdentity':
                return '<identity>'
            case 'OptSBOLVersion':
                return '<sbol-version>'
            case 'OptString':
                return '<string>'
            case 'OptURL':
                return '<url>'
            case 'OptVcParameters':
                return '<vc-params>'
            default:
                return '<arg>'
        }
    }
}
