
export default interface Test {

    id:string

    name:string

    glob?:string[]

    command:string|((filename:string)=>string)

    validate:(output:string|undefined) => Promise<void>

}

