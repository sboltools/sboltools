import Opt from "./Opt";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { Predicates, Prefixes } from "bioterms";
import { triple, Graph } from "sbolgraph";
import ActionResult from "../ActionResult";
import { text } from "../../output/output";
import ActionDef, { OptDef } from "../ActionDef";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { ArgvOptionSet } from "../../parse-argv";
import { trace } from "../../output/print";
import * as fs from 'fs'

export default class OptURL extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }


    getURL():string {
        return this.argv.getString(this.optDef.name, '')
    }
    
    async downloadToString():Promise<string> {

        let url = this.getURL()

        if(!url) {
            return ''
        }

        trace(text('Downloading ' + url + '...'))

        if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {

            let res = await fetch(url)
            return await res.text()

        } else if(url.indexOf('file:///') === 0) {

            let res = await loadFile(url.split('file:///')[1])
            return res + ''

        } else {

            // treat everything else as a filename

            let res = await loadFile(url)
            return res + ''

        }

    }

}

function loadFile(filename) {

    return new Promise((resolve, reject) => {

        fs.readFile(filename, (err, file) => {
            if(err)
                reject(err)
            else
                resolve(file)
        })

    })
}