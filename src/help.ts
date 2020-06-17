export default `
✨ *sboltools 0.1.0                                   SBOL 1.1.0   2.3.0   3.0.0*
      -> using sbolgraph 1.0.0
      -> questions/comments please contact James McLaughlin <james@mclgh.net>

**Usage**

    sbol [--input <format>] [--output <format>]
            [--nonsbol-conversion-target <format>]
                [url|filename] [url2|filename2] ...
                    [action1] [action1args]
                    [action2] [action2args]
                    ...

This tool allows the manipulation of files describing biological systems using
the Synthetic Biology Open Language (SBOL) and other related standards such as
FASTA and GenBank.

For docs, check out http://www.sboltools.org
`
.trim()
