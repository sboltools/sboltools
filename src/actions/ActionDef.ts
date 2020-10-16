import ActionResult from "./ActionResult";
import { Graph } from "sbolgraph";
import Opt from "./opt/Opt";
import { ArgvOptionSet } from "../parse-argv";
import Context from "../Context";

export default interface ActionDef {
    name: string,
    description?: string,
    help?:string

    category:
        'graph'
        | 'local-conversion'
        | 'vc'
        | 'object-cd'
        | 'rel-cd'
        | 'seq-anno'
        | 'graphops'
        | 'other'


    namedOpts: OptDef[],
    positionalOpts: OptDef[],

    run: (ctx: Context, namedOpts: Opt[], positionalOpts: string[]) => Promise<ActionResult>
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
    for(let forOpt of def.namedOpts.filter(opt => opt.name.indexOf('for') === 0 || opt.name.indexOf('within') === 0)) {
        doneOpts.add(forOpt)
        addLine(descNamedOpt(forOpt))
    }

    // then mandatory ones
    for(let opt of def.namedOpts.filter(opt => !opt.optional)) {
        if(!doneOpts.has(opt)) {
            doneOpts.add(opt)
            addLine(descNamedOpt(opt))
        }
    }

    // then everything else
    for(let opt of def.namedOpts) {
        if(!doneOpts.has(opt)) {
            doneOpts.add(opt)
            addLine(descNamedOpt(opt))
        }
    }

    // finally, positional args
    for(let opt of def.positionalOpts) {
        addLine(descPositionalOpt(opt))
    }


    return out

    function addLine(line) {
        out += ' '.repeat(indent) + line + '\n'
        indent += 4
    }

    function descNamedOpt(opt:OptDef) {
        return [
            opt.optional === true ? '[' : '',
            opt.name.length > 0 ? '--' + opt.name : opt.name,
            ' ' + argType(opt),
            opt.optional === true ? ']' : '',
        ].join('')
    }

    function descPositionalOpt(opt:OptDef) {
        return [
            opt.optional === true ? '[' : '<',
            opt.name,
            opt.optional === true ? ']' : '>',
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
