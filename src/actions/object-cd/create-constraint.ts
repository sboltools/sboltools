

import { text, group, spacer, header, indent, conditional } from "../../output/output"
import { Graph, node } from "rdfoo"
import ActionResult, { Outcome } from "../ActionResult"
import Opt from "../opt/Opt"
import ActionDef from "../ActionDef"
import { strict as assert } from 'assert'
import { SBOLVersion } from "../../util/get-sbol-version-from-graph"
import { SBOL1GraphView, S1DnaComponent, SBOL2GraphView, SBOL3GraphView } from "sboljs"
import OptIdentity from "../opt/OptIdentity"
import { Predicates, Prefixes, Types } from "bioterms"
import { Existence } from "../../identity/IdentityFactory"
import Identity from "../../identity/Identity"
import { trace } from "../../output/print";
import Context from "../../Context"
import OptTerm  from "../opt/OptTerm"
import { TermType } from "../../vocab"

let createConstraintAction:ActionDef = {
    name: 'constraint',
    description: 'Creates a constraint',
    category: 'object-cd',
    namedOpts: [  
        {
            name: '',
            type: OptIdentity
        },
        {
            name: 'subject',
            type: OptIdentity,
            optional: false
        },
        {
            name: 'restriction',
            type: OptTerm,
            optional: false
        },
        {
            name: 'object',
            type: OptIdentity,
            optional: false
        }
    ],
    positionalOpts: [  
        {
            name: '',
            type: OptIdentity,
            optional: true
        }
    ],
    run: createConstraint
}

export default createConstraintAction

async function createConstraint(ctx:Context, namedOpts:Opt[], positionalOpts:Opt[]):Promise<ActionResult> {

    let g = ctx.getCurrentGraph()

    trace(text('createConstraint'))

    let [ optNamedIdentity, optSubject, optRestriction, optObject ] = namedOpts

    assert(optNamedIdentity instanceof OptIdentity)
    assert(optSubject instanceof OptIdentity)
    assert(optRestriction instanceof OptTerm)
    assert(optObject instanceof OptIdentity)

    
    let [ optPositionalIdentity ] = positionalOpts

    assert(!optPositionalIdentity || optPositionalIdentity instanceof OptIdentity)

    let identity = (optPositionalIdentity || optNamedIdentity).getIdentity(ctx, Existence.MustNotExist)
    assert(identity !== undefined)

    let subjectIdentity = optSubject.getIdentity(ctx, Existence.MustExist)

    if(!subjectIdentity) {
        throw new ActionResult(text('Constraint subject does not exist'))
    }

    if(subjectIdentity.parentURI !== identity.parentURI) {
        throw new ActionResult(text('Constraint subject must have the same parent as the constraint'))
    }

    let objectIdentity = optSubject.getIdentity(ctx, Existence.MustExist)

    if(!objectIdentity) {
        throw new ActionResult(text('Constraint object does not exist'))
    }

    if(objectIdentity.parentURI !== identity.parentURI) {
        throw new ActionResult(text('Constraint object must have the same parent as the constraint'))
    }

    switch(identity.sbolVersion) {
        case SBOLVersion.SBOL2:
            return createConstraintSBOL2(g, identity, subjectIdentity, optRestriction, objectIdentity)
        case SBOLVersion.SBOL3:
            return createConstraintSBOL3(g, identity, subjectIdentity, optRestriction, objectIdentity)
        default:
            throw new ActionResult(text('Unsupported SBOL version for create-component'))
    }

    return new ActionResult()
}

function createConstraintSBOL2(g:Graph, identity:Identity, subject:Identity, optRestriction:OptTerm, object:Identity):ActionResult {

    let restriction = optRestriction.getTerm(TermType.RestrictionSBOL2)
    assert(restriction)

    let gv = new SBOL2GraphView(g)

    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL2.SequenceConstraint),
        [Predicates.SBOL2.displayId]: node.createStringNode(identity.displayId),
        [Predicates.SBOL2.restriction]: node.createUriNode(restriction)
    })

    if(identity.version !== undefined) {
        g.insertProperties(node.createUriNode(identity.uri), {
            [Predicates.SBOL2.version]: node.createStringNode(identity.version)
        })
    }

    assert(identity.parentURI)

    g.insertProperties(node.createUriNode(identity.parentURI), {
        [Predicates.SBOL2.sequenceConstraint]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}


function createConstraintSBOL3(g:Graph, identity:Identity, subject:Identity, optRestriction:OptTerm, object:Identity):ActionResult {

    let restriction = optRestriction.getTerm(TermType.RestrictionSBOL3)
    assert(restriction)

    let gv = new SBOL3GraphView(g)



    let namespace = identity.namespace
    assert(namespace)


    g.insertProperties(node.createUriNode(identity.uri), {
        [Predicates.a]: node.createUriNode(Types.SBOL3.Constraint),
        [Predicates.SBOL3.displayId]: node.createStringNode(identity.displayId),
        [Prefixes.sbol3 + 'namespace']: node.createUriNode(identity.namespace),
    })


    assert(identity.parentURI)

    g.insertProperties(node.createUriNode(identity.parentURI), {
        [Predicates.SBOL3.hasConstraint]: node.createUriNode(identity.uri),
    })

    return new ActionResult()
}

