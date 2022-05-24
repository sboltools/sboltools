<img align="left" width="150" height="150" src="/icon/icon.png" alt="sboltools">

# sboltools
A CLI for the [Synthetic Biology Open Language (SBOL)](http://sbolstandard.org)

<hr>

<p></p>

View and edit SBOL files from the command line, without writing any code!

Based on the [sboljs3](https://github.com/SynBioDex/sboljs3) library.

![sboltools test workflow](https://github.com/sboltools/sboltools/workflows/sboltools%20test%20workflow/badge.svg)
![sboltools release workflow](https://github.com/sboltools/sboltools/workflows/sboltools%20release%20workflow/badge.svg)

[Docs](http://sboltools.org/docs.html#installation)

## Installation

If you are only interested in **using** sboltools and not developing it, see the [installation instructions in the docs](http://sboltools.org/docs.html#installation) for pre-built packages.

### Building from source

If you want to build sboltools from source, clone this repo and build it using:

    npm install
    npm run build

This will generate a file called `sbol.js` containing sboltools and all of its dependencies. All you need to run it is node.js:

    node sbol.js


### REPL in the browser

Though it is a command line utility, sboltools is written in JavaScript. One of the nice consequences of this is that you can run sboltools entirely in a browser. An example of this is included in the file `repl.html` in this repository. To use it, build sboltools using:

    npm install
    npm run build-browser

This will generate a file called `sbol_browser.js` containing sboltools and all of its dependencies, especially packaged for use in the browser environment. You can now open `repl.html` in a browser to use sboltools.

A publicly accessible instance of this repl is hosted at [https://sboltools.org/repl.html](https://sboltools.org/repl.html).





