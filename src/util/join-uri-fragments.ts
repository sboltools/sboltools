
export default function joinURIFragments(t:(string|undefined)[]) {

    let s = ''

    for(let token of t) {

        if(token === undefined)
            continue

        if(s.length > 0 && token[0] !== '/' && s[s.length - 1] !== '/')
            s += '/'

        s += token
    }

    return s

}