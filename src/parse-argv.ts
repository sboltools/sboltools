

import actionDefs from './actions'
import { trace } from './output/print'

export class ArgvArgs {
    constructor(
        public globalOpts:ArgvOptionSet,
        public actions:ArgvAction[]
    ) {
    }
}

export class ArgvAction {
    constructor(
        public name:string,
        public namedOpts:ArgvOptionSet,
        public positionalOpts:string[]
    ) {
    }
}

export class ArgvNamedOption {
    constructor(
        public name?:string,
        public value?:string
    ) {
    }
}

export class ArgvOptionSet {
    constructor(
        public opts:ArgvNamedOption[]
    ) {
    }
    getStringOrUndefined(opt:string):string|undefined {
        let value = this.opts.filter(o => o.name === opt)[0]?.value
        return value
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


    let globalOpts:ArgvNamedOption[] = []
    let actions:ArgvAction[] = []


    // Global opts

    while(args.length > 0) {

        let { type, name } = parseToken(args[0])

        if(type === TokenType.Option) {

            args.shift()

            let option:ArgvNamedOption = { name }

	    if(args[0]) {
		if(parseToken(args[0]).type === TokenType.Other) {
			option.value = args.shift()
		}
	    }

            globalOpts.push(option)

            continue

        } else {

            break

        }
    }


    // Actions

    while(args.length > 0) {

        actions.push(parseAction())

    }

    return new ArgvArgs(new ArgvOptionSet(globalOpts), actions)


    function parseAction():ArgvAction {
        
        let name = args.shift() as string
        let def = actionDefs.filter(a => a.name === name)[0]
        let namedOpts:ArgvNamedOption[] = []
        let positionalOpts:string[] = []

        let nPositionalRemaining = def?.positionalOpts.length

        while(args.length > 0) {

            let { name, type } = parseToken(args[0])


            if(type !== TokenType.Option) {

                if(nPositionalRemaining > 0) {
                    -- nPositionalRemaining
                    positionalOpts.push(args[0])
                    args.shift()
                    continue
                } else {
                    break
                }
            }

            args.shift()

            let option: ArgvNamedOption = { name }

            if(parseToken(args[0]).type !== TokenType.Action) {
                option.value = args.shift()
            }

            namedOpts.push(option)
        }

        return new ArgvAction(name, new ArgvOptionSet(namedOpts), positionalOpts)
    }
}

function isAction(str) {
    return actionDefs.filter(a => a.name === str).length > 0
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

