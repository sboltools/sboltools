
// var NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default
// var NodeGlobalsPolyfills = require('@esbuild-plugins/node-globals-polyfill').default
var { build } = require('esbuild')


const stdlibBrowserPlugin = require('node-stdlib-browser/helpers/esbuild/plugin');
const stdLibBrowser = require('node-stdlib-browser');

delete stdLibBrowser.fs


let globals = {
}


build({
	// logLevel: 'verbose',
    bundle: true,
    entryPoints:['./src/browser.ts'],
    platform: 'browser',

    inject: [
        require.resolve('node-stdlib-browser/helpers/esbuild/shim'),
    ],

    define: {
	    global: 'global',
	    process: 'process',
	    Buffer: 'Buffer',
        fs: 'fs'
    },

    plugins: [

        {
            name: 'BrowserFS',
            setup: (build) => {

                build.onResolve({ filter: /^fs$/ }, args => ({
                    path: args.path,
                    namespace: 'fs',
                }))

                build.onLoad({ filter: /.*/, namespace: 'fs' }, () => ({
                    contents: 'fs = window.require("fs"); module.exports = fs;',
                    loader: 'js',
                }))

            }
        },

	stdlibBrowserPlugin(stdLibBrowser),
        // NodeGlobalsPolyfills(),
        // NodeModulesPolyfills(),
        //
	],
	// {
	// 	name: 'fontawesomefix',
	// 	setup: (build) => {

	// 		build.onResolve({filter:/.*/},(args) => {
	// 			if(args.kind === "url-token")
	// 				return { path: args.path, external: true }

	// 		})
	// 	}
	// }
    
    outfile: 'sbol_browser.js',
    sourcemap: true,
    loader: {
	    '.woff': 'dataurl',
	    '.woff2': 'dataurl',
	    '.eot': 'dataurl',
	    '.ttf': 'dataurl',
	    '.svg': 'dataurl'
    }
})
