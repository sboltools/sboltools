

import { strict as assert } from 'assert'

export default class Chain {

    static isChain(chain:string) {
        return chain[0] === '.'
    }

    static isEmpty(chain:string) {
        return Chain.tokens(chain).length === 0
    }

    static context(chain:string) {
        return '.' + Chain.tokens(chain).slice(0, -1).join('.')
    }

    static displayId(chain:string) {
        return Chain.tokens(chain).pop()
    }

    static tokens(chain:string) {
        assert(Chain.isChain(chain))
        return chain.slice(1).split('.')
    }

}
