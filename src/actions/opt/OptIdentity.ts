import Opt from "./Opt";
import ActionDef, { OptDef } from "../ActionDef";
import { Graph, identifyFiletype } from "rdfoo";
import Identity from "../../identity/Identity";
import { ArgvOptionSet } from "../../parse-argv";
import ActionResult, { actionResultAbort } from "../ActionResult";
import { text, indent, spacer, group, tabulated } from "../../output/output";
import { getConsensusSBOLVersion, ConsensusVersion } from "./helper/get-consensus-sbol-version";
import { SBOLVersion } from "../../util/get-sbol-version-from-graph";
import { trace } from "../../output/print";

export default class OptIdentity extends Opt {

    constructor(actDef:ActionDef, optDef: OptDef, argv:ArgvOptionSet) {
        super(actDef, optDef, argv)
    }

    getIdentity(g:Graph):Identity|undefined {

        let paramPrefix = this.optDef.name !== '' ? this.optDef.name + '-' : ''

        let namespace = this.argv.getString(paramPrefix + 'namespace', '')
        let displayId = this.argv.getString(paramPrefix + 'displayId', '')
        let version = this.argv.getString(paramPrefix + 'version', '')
        let context = this.argv.getString(paramPrefix + 'context', '')
        let identity = this.argv.getString(paramPrefix + 'identity', '')
        let sbolversion = this.argv.getString(paramPrefix + 'sbol-version', '')


        if(!namespace && !displayId && !version && !context && !identity && !sbolversion) {
            if(this.optDef.optional === true) {
                return 
            }
        }


        let sbolVersion = SBOLVersion.Empty

        let inferSBOLVersion = this.optDef.refinements?.inferSBOLVersion !== false

        if(sbolversion === '1') {
            sbolVersion = SBOLVersion.SBOL1
        } else if(sbolversion === '2') {
            sbolVersion = SBOLVersion.SBOL2
        } else if(sbolversion === '3') {
            sbolVersion = SBOLVersion.SBOL3
        } else {
            if(!inferSBOLVersion) {
                throw actionResultAbort(text(`Please specify --${paramPrefix}sbol-version 1/2/3`))
            }
            let consensus = getConsensusSBOLVersion(g)
    
            if(consensus === ConsensusVersion.SBOL1)
                sbolVersion = SBOLVersion.SBOL1
            else if(consensus === ConsensusVersion.SBOL2)
                sbolVersion = SBOLVersion.SBOL2
            else if(consensus === ConsensusVersion.SBOL3)
                sbolVersion = SBOLVersion.SBOL3
            else {
                throw actionResultAbort(text(`Could not infer input SBOL version from current graph (is it empty, or does it contain mixed SBOL versions?); please specify --${paramPrefix}sbol-version 1/2/3`))
            }
        }





        let allOptions = { namespace, displayId, context, identity }

        let anyCombinations:IdentityParamCombination[] = [

            { namespace, identity, // TL or child (child only possible if identity is chain which indicates context)
                getIdentity:() => Identity.from_namespace_and_identity(sbolVersion, g, namespace, identity, version)  },

            { identity, // TL or child (has to be only one namespace in graph; child only possible if identity is chain which indicates context)
                getIdentity:() => Identity.from_identity(sbolVersion, g, identity, version)
            }

        ]

        let tlCombinations:IdentityParamCombination[] = [

            { namespace, displayId, // TL
                getIdentity:() => Identity.toplevel_from_namespace_displayId(sbolVersion, g, namespace, displayId, version)
            },

            { displayId, // TL (has to be only one namespace in graph)
                getIdentity: () => Identity.toplevel_from_displayId(sbolVersion, g, displayId, version)
            }
        ]

        let childCombinations:IdentityParamCombination[] = [

            { namespace, context, displayId, // child
                getIdentity:() => Identity.child_from_namespace_context_displayId(sbolVersion, g, namespace, context, displayId, version)
            },

            { context, displayId, // child
                getIdentity: () => Identity.child_from_context_displayId(sbolVersion, g, context, displayId, version)
            }
        ]

        let allCombinations:IdentityParamCombination[] = anyCombinations
                .concat(tlCombinations)
                .concat(childCombinations)

        var combo:any

        eachCombo:
        for(combo of allCombinations) {

            // are any of the combination required params empty?
            if(Object.values(combo).filter(v => v === '').length > 0) {
                continue
            }

            // are any other identity params populated that shouldn't be?
            for(let k of Object.keys(allOptions)) {
                if(Object.keys(combo).indexOf(k) !== -1) {
                    // this option is present in this combination; all good
                    continue
                }
                // this option is not present in this combination
                if(allOptions[k] !== '') {
                    // and it's populated; this is not our combo
                    continue eachCombo
                }
            }

            trace(text('identity combination: ' + JSON.stringify(combo) + ' ' + combo.getIdentity))

            return combo.getIdentity()
        }

        throw badCombo(this.actDef.name, paramPrefix)
    }
}

function badCombo(action:string, paramPrefix:string):ActionResult {
    let paramName = paramPrefix.slice(0, -1)
    return actionResultAbort(group([
        text(`Please specify a valid combination of identity parameters${paramPrefix ? ' for --' + paramName : ''}.  The following combinations are supported:`),
        spacer(),
        tabulated([
                [ `--${paramPrefix}namespace, --${paramPrefix}identity`, `Identifies a top-level, or a child if --${paramPrefix}identity is an identity chain and provides context` ],
                [ `--${paramPrefix}identity`, `Identifies a top-level, or a child if --${paramPrefix}identity is an identity chain and provides context` ],
                [ `--${paramPrefix}namespace, --${paramPrefix}displayId`, `Identifies a top-level` ],
                [ `--${paramPrefix}displayId`, `Identifies a top-level` ],
                [ `--${paramPrefix}namespace, --${paramPrefix}context, --${paramPrefix}displayId`, `Identifies a child object` ],
                [ `--${paramPrefix}context, --${paramPrefix}displayId`, `Identifies a child object` ]
            ]
        )
    ]))

}

function sameValues(arr1, arr2) {
    return arr1.length === arr2.length &&
                arr1.every(v => arr2.indexOf(v) !== -1)
}


interface IdentityParamCombination {
    namespace?:string
    displayId?:string
    version?:string
    context?:string
    identity?:string
    getIdentity:()=>Identity
}
