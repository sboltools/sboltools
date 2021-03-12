
export default function getLastURIFragment(uri:string) {

    let slash = uri.lastIndexOf('/')
    let hash = uri.lastIndexOf('#')
    let eq = uri.lastIndexOf('=')
    if(slash !== -1) {
        return uri.slice(slash + 1)
    }
    if(hash !== -1) {
        return uri.slice(hash + 1)
    }
    if(eq !== -1) {
        return uri.slice(eq + 1)
    }
    throw new Error('could not extract last uri fragment')
}
