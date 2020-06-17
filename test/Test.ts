
export default interface Test {

    id:string

    name:string

    command:string

    validate:(output:string|undefined) => Promise<void>

}

