
import _import from './import'
import convert from './convert'
import create_sequence from './object-cd/create-sequence'
import components from './components'
import vcValidate from './validate'
import createConstraint from './object-cd/create-constraint'
import createComponent from './object-cd/create-component'
import createModule from './object-cd/create-module'
import createInteraction from './object-cd/create-interaction'
import createParticipation from './object-cd/create-participation'
import render from './render'
import annotate_range from './annotate-range'
import addSubcomponent from './add-subcomponent'
import createParticipant from './object-cd/create-participant'
import dumpGraph from './dump-graph'
import showGraphs from './show-graphs'
import graph from './graph'
import graphCompare from './compare'
import graphMerge from './merge'
import graphInsert from './insert'
import namespace from './namespace'
import sbolVersion from './sbol-version'
import runTests from './run-tests'
import dna from './object-cd/dna'
import protein from './object-cd/protein'

export default [
    _import,
    convert,
    components,
    vcValidate,
    createComponent,
    dna,
    protein,
    createConstraint,
    createModule,
    createInteraction,
    createParticipation,
    create_sequence,
    render,
    annotate_range,
    addSubcomponent,
    createParticipant,
    dumpGraph,
    showGraphs,
    graph,
    graphCompare,
    graphMerge,
    graphInsert,
    namespace,
    sbolVersion,
    runTests
]

