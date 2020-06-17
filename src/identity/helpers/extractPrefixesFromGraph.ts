import { Graph } from "rdfoo"
import inventUriPrefix from "./inventURIPrefix"

export function extractPrefixesFromGraph(g:Graph) {

    let subjects = g.subjects
    let prefixes = new Set<string>()

    for(let s of subjects) {

        let prefix = inventUriPrefix(s)

        prefixes.add(prefix)

    }


    let arr = Array.from(prefixes)
    arr.sort((a, b) => a.length - b.length)
    return arr

    // for(let sA of subjects) {

    //     for(let sB of subjects) {

    //         if(sA === sB)
    //             continue

    //         let prefix = commonPrefix(sA, sB)

    //         if(prefix && prefix[prefix.length - 1] === '/' || prefix[prefix.length - 1] === '#') {
    //             prefixes.add(prefix)
    //         }
    //     }
    // }
}

// function commonPrefix(s1, s2) {

//     for(let i = 0; i < s1.length; ++ i) {
//         if(s2[i] !== s1[i]) {
//             return s1.slice(0, i)
//         }
//     }

//     return s1
// }
