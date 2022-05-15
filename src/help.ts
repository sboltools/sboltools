export default `
✨ *sboltools 0.1.0                                   SBOL 1.1.0   2.3.0   3.0.0*
      -> using sboljs 1.0.0
      -> questions/comments please contact James McLaughlin <james@mclgh.net>

**Usage**

    sbol [--output <format>]
            [action1] [action1args]
            [action2] [action2args]
            ...

This tool allows the manipulation of files describing biological systems using
the Synthetic Biology Open Language (SBOL) and other related standards such as
FASTA and GenBank.

Available actions:

%actions%

For help with a specific action, try:

    sbol <action> --help

For comprehensive documentation, check out http://sboltools.github.io
`
.trim()
