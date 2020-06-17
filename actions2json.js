
fs = require('fs')

def2usage = require('./dist/src/actions/ActionDef')['def2usage']

actions = require('./dist/src/actions/index')['default']
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(action => {
        return {
            name: action.name,
            description: action.description,
            category: action.category,
            help: action.help,
            usage: def2usage(action),
            options: action.opts.map((opt) => {

                return {
                    name: opt.name,
                    type: opt.type.name,
                    optional: opt.optional
                }

            })
        }
    })

console.log(JSON.stringify(actions, null, 2))


