

import actions from './actions'
import { trace } from './output/print'

export class ArgvArgs {
    constructor(
        public resources:string[],
        public globalOpts:ArgvOptionSet,
        public actions:ArgvAction[]
    ) {
    }
}

export class ArgvAction {
    constructor(
        public name:string,
        public options:ArgvOptionSet
    ) {
    }
}

export class ArgvOption {
    constructor(
        public name?:string,
        public value?:string
    ) {
    }
}

export class ArgvOptionSet {
    constructor(
        public opts:ArgvOption[]
    ) {
    }

    getString(opt:string, def:string):string {
        let value = this.opts.filter(o => o.name === opt)[0]?.value
        return value === undefined ? def : value
    }

    getFlag(opt:string):boolean {
        let value = this.opts.filter(o => o.name === opt)[0]
        return value !== undefined
    }
}

enum TokenType {
    Option,
    Action,
    Other
}

export default function parseArgv(argv:string[]):ArgvArgs {

    let args = argv.slice(2)


    let resources:string[] = []
    let globalOpts:ArgvOption[] = []
    let actions:ArgvAction[] = []


    // Global opts and resources

    while(args.length > 0) {

        let { type, name } = parseToken(args[0])

        if(type === TokenType.Action)
            break

        if(type === TokenType.Option) {

            args.shift()

            let option:ArgvOption = { name }

            if(parseToken(args[0]).type === TokenType.Other) {
                option.value = args.shift()
            }

            globalOpts.push(option)

            continue
        }

        resources.push(args.shift() as string)
    }


    // Actions

    while(args.length > 0) {

        actions.push(parseAction())

    }

    return new ArgvArgs(resources, new ArgvOptionSet(globalOpts), actions)


    function parseAction():ArgvAction {
        
        let name = args.shift() as string
        let options:ArgvOption[] = []

        for(;;) {

            let { name, type } = parseToken(args[0])

            if(type !== TokenType.Option)
                break

            args.shift()

            let option: ArgvOption = { name }

            if(parseToken(args[0]).type === TokenType.Other) {
                option.value = args.shift()
            }

            options.push(option)
        }

        return new ArgvAction(name, new ArgvOptionSet(options))
    }
}

function isAction(str) {
    return actions.filter(a => a.name === str).length > 0
}

function parseToken(str):{type:TokenType, name?:string} {
    if (/^-[^-]/g.test(str)) {
        return { type: TokenType.Option, name: str.slice(1) }
    } else if(/^--[^-]/g.test(str)) {
        return { type: TokenType.Option, name: str.slice(2) }
    } else if(isAction(str)) {
        return { type: TokenType.Action }
    } else {
        return { type: TokenType.Other }
    }
}

