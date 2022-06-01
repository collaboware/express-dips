import * as rdf from 'rdflib'
import { LiteralTermType } from 'rdflib/lib/types'

import { dc, owl, rdf as rdfNamespace, rdfs } from '../namespaces'

import { Property, RdfClass, Vocabulary } from './model'

const store = rdf.graph()
const fetcher = new rdf.Fetcher(store)

export type ExtractedVocab = Omit<Vocabulary, 'properties'> & {
  classes: ExtractedClass[]
  properties: ExtractedProperty[]
}

export type ExtractedClass = Omit<RdfClass, 'inherits'> & {
  inherits: string
}

export type ExtractedProperty = Omit<Property, 'domain' | 'range'> & {
  domain: string
  range: string
}

export const extractVocabulary = async (
  link: string
): Promise<ExtractedVocab | null> => {
  return await fetcher.load(link).then((): ExtractedVocab | null => {
    const ontology = store.any(
      null,
      rdf.sym(rdfNamespace.type),
      rdf.sym(owl.Ontology),
      rdf.sym(link).doc()
    )
    if (ontology) {
      const name = store.any(
        ontology as rdf.Variable,
        rdf.sym(dc.title),
        null,
        rdf.sym(link)
      )
      const slug = Object.keys(store.namespaces).find(
        (key) => store.namespaces[key] === ontology.value
      )
      if (name?.termType === LiteralTermType && slug) {
        const vocab = {
          name: name.value,
          slug,
          link: ontology.value,
        }
        return {
          ...vocab,
          classes: extractClasses(ontology.value, link),
          properties: extractProperties(ontology.value, link),
        } as ExtractedVocab
      }
    }
    return null
  })
}

const extractClasses = (ontology: string, link: string): ExtractedClass[] => {
  const classNodes = store
    .each(
      null,
      rdf.sym(rdfNamespace.type),
      rdf.sym(rdfs.rdfClass),
      rdf.sym(link)
    )
    .map((node) => {
      const label = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.label),
        null,
        rdf.sym(link)
      )?.value as string
      const description = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.comment),
        null,
        rdf.sym(link)
      )?.value as string
      const subClassOf = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.subClassOf),
        null,
        rdf.sym(link)
      )?.value as string
      return {
        slug: node.value.replace(ontology, ''),
        name: label,
        description: description,
        inherits: subClassOf,
      } as ExtractedClass
    })
  return classNodes
}

const extractProperties = (
  ontology: string,
  link: string
): ExtractedProperty[] => {
  const propertyNodes = store
    .each(
      null,
      rdf.sym(rdfNamespace.type),
      rdf.sym(rdfNamespace.Property),
      rdf.sym(link)
    )
    .map((node) => {
      const label = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.label),
        null,
        rdf.sym(link)
      )?.value as string
      const description = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.comment),
        null,
        rdf.sym(link)
      )?.value as string
      const range = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.range),
        null,
        rdf.sym(link)
      )?.value as string
      const domain = store.any(
        node as rdf.Variable,
        rdf.sym(rdfs.domain),
        null,
        rdf.sym(link)
      )?.value as string
      return {
        slug: node.value.replace(ontology, ''),
        name: label,
        description: description,
        range,
        domain,
      }
    })
  return propertyNodes as ExtractedProperty[]
}
