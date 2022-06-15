
export default class TwoWayMapping {

    aToBMap:Map<string,string>
    bToAMap:Map<string,string>

    constructor(obj:any) {
        this.aToBMap = new Map()
        this.bToAMap = new Map()

        for(let a of Object.keys(obj)) {
            this.aToBMap.set(a, obj[a])
            this.bToAMap.set(obj[a], a)
        }
    }

    aToB(a:string) {
        return this.aToBMap.get(a)
    }

    bToA(b:string) {
        return this.bToAMap.get(b)
    }



}