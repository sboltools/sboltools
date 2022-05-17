
// var NodeModulesPolyfills = require('@esbuild-plugins/node-modules-polyfill').default
// var NodeGlobalsPolyfills = require('@esbuild-plugins/node-globals-polyfill').default
var { build } = require('esbuild')


build({
	// logLevel: 'verbose',
    bundle: true,
    entryPoints:['./src/main.ts'],
    platform: 'node',

    //inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],

    define: {
	    global: 'global',
	    process: 'process',
	    Buffer: 'Buffer',

    },

    inject: [
    ],

    external: [
	    'canvas',
    ],

    plugins: [
      ],


    outfile: 'sbol.js',
    sourcemap: 'inline',
    loader: {
	    '.woff': 'dataurl',
	    '.woff2': 'dataurl',
	    '.eot': 'dataurl',
	    '.ttf': 'dataurl',
	    '.svg': 'dataurl'
    }
})






