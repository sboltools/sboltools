

import sboltools from './sboltools'

main()

async function main() {

    let out = await sboltools(process.argv)

    if(out) {
        process.stdout.write(out)
    }

}



