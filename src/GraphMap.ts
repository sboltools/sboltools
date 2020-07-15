import { Graph } from "rdfoo";

export default class GraphMap {

    graphs:Map<string,Graph>
    currentGraph:Graph

    constructor() {
        this.graphs = new Map()
        this.currentGraph = new Graph()
        this.graphs.set('default', this.currentGraph)
    }

    getCurrentGraph():Graph {
        return this.currentGraph
    }

    setCurrentGraph(name:string) {

        let g = this.graphs.get(name.toLowerCase())

        if(!g) {
            g = new Graph()
            this.graphs.set(name.toLowerCase(), g)
        }

        this.currentGraph = g
    }

    getGraph(name:string):Graph|undefined {

        let g = this.graphs.get(name.toLowerCase())
        
        return g

    }
}
