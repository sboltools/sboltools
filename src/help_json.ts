

import actions from './actions/index'
import { def2usage } from './actions/ActionDef'

export default function jsonHelp() {

	return JSON.stringify( 
		
		actions .sort((a, b) => a.name.localeCompare(b.name))
	.map(action => {
		return {
		name: action.name,
		description: action.description,
		category: action.category,
		help: action.help,
		usage: def2usage(action),
		options: action.namedOpts.map((opt) => {

			return {
			name: opt.name,
			type: opt.type.name,
			optional: opt.optional
			}

		})
		.concat(action.positionalOpts.map((opt) => {

			return {
			name: opt.name,
			type: opt.type.name,
			optional: opt.optional
			}

		}))
		}
	}),

	null, 2
	)
}

