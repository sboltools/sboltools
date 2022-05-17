
var fs = require('fs')

var sbol = fs.readFileSync('sbol.js') + ''

var sbol_unix = [
    '#!/usr/bin/env -S node --no-deprecation',
    sbol
].join('\n')

var sbol_win32 = [
    '@echo off',
    'setlocal',
    '%~dp0\\node.exe %~dp0\\sbol.js %*',
    ''
].join('\r\n')

fs.writeFileSync('./bin/dist/unix/sbol', sbol_unix, { mode: 0o755 })
fs.writeFileSync('./bin/dist/win32-x86/sbol.js', sbol)
fs.writeFileSync('./bin/dist/win32-x86/sbol.cmd', sbol_win32)
fs.writeFileSync('./bin/dist/win32-x64/sbol.js', sbol)
fs.writeFileSync('./bin/dist/win32-x64/sbol.cmd', sbol_win32)




