
export default function inventUriPrefix(uri:string) {
    let slash = uri.lastIndexOf('/')
    let hash = uri.lastIndexOf('#')
    if(slash !== -1) {
        return uri.slice(0, slash + 1)
    }
    if(hash !== -1) {
        return uri.slice(0, hash + 1)
    }
    return ''
}