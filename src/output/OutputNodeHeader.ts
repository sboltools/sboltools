
import OutputNode from './OutputNode'

export default class OutputNodeHeader extends OutputNode {

    style:string

    constructor(public title:string, style?:any) {

        super()

        this.style = style || 'white bold underline'
    }

}

