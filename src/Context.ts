import { Graph } from "rdfoo";
import { SBOLVersion } from "./util/get-sbol-version-from-graph";

export default class Context {

    graphs:Map<string,Graph>
    currentGraph:Graph
    currentNamespace:string
    sbolVersion:SBOLVersion

    constructor() {
        this.graphs = new Map()
        this.currentGraph = new Graph()
        this.graphs.set('default', this.currentGraph)
        this.currentNamespace = ''
        this.sbolVersion = SBOLVersion.Empty
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
