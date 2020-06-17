
import OutputNode from './OutputNode'

export default class OutputNodeText extends OutputNode {

    public text:string
    public style:string

    constructor(text:string, style?:string) {
        super()
        this.text = text
        this.style = style || ''
    }

}
