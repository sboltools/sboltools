import chalk = require("chalk")

export function applyStyles(str:string, style:string) {

    if(style === '')
        return str

    let fns = style.split(' ')

    let fn = chalk[fns[0]]

    if (!fn) {
        throw new Error('unknown style: ' + fns[0])
    }

    for(let s of fns.slice(1)) {

        if(s === 'caps') {
            str = str.toUpperCase()
            continue
        }

        fn = fn[s]

        if(!fn) {
            throw new Error('unknown style: ' + s)
        }
    }

    return fn(str)
}

