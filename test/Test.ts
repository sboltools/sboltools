
export default interface Test {

    id:string

    name:string

    glob?:string[]
    globExclude?:string[]

    command:string|((filename:string)=>string)

    validate:(output:string|undefined) => Promise<void>

}

