import { toCamelCase, toPascalCase } from 'js-convert-case'
import { FindOptionsWhere } from 'typeorm'

import { IPSDataSource } from '../datasource'
import { User } from '../User/model'

import { ExtractedClass, extractVocabulary } from './extract'
import {
  Property,
  PropertyCreationParams,
  RdfClass,
  ClassCreationParams,
  Vocabulary,
  VocabularyUpdateParams,
  PropertyUpdateParams,
  ClassUpdateParams,
} from './model'

const userRepo = IPSDataSource.getRepository<User>('User')
const vocabRepo = IPSDataSource.getRepository<Vocabulary>('Vocabulary')
const rdfClassesRepo = IPSDataSource.getRepository<RdfClass>('RdfClass')
const propertiesRepo = IPSDataSource.getRepository<Property>('Property')

export enum ErrorMessages {
  VOCAB_NOT_FOUND = 'The specified Vocabulary does not exist',
  VOCAB_ALREADY_EXISTS = 'The specified Vocabulary already exists',
}

export const splitLinkIntoVocabAndMember = (link: string): [string, string] => {
  const hashIndex =
    (link.lastIndexOf('#') !== -1 && link.lastIndexOf('#')) ||
    link.lastIndexOf('/')
  const vocab = link.substring(0, hashIndex + 1)
  const member = link.replace(vocab, '')
  return [vocab, member]
}

export class VocabularyService {
  private async _addExtractedClasses(
    vocab: string,
    classes: ClassCreationParams[]
  ): Promise<RdfClass[]> {
    return (
      await Promise.all(
        classes.map(async (cls) => {
          return await this.createClass(vocab, cls)
        })
      )
    ).filter((cls) => typeof cls !== 'string') as RdfClass[]
  }

  private async _addExtractedProperties(
    vocab: string,
    properties: PropertyCreationParams[]
  ): Promise<Property[]> {
    return (
      await Promise.all(
        properties.map(async (prop) => {
          return await this.createProperty(vocab, prop)
        })
      )
    ).filter((prop) => typeof prop !== 'string') as Property[]
  }

  private async addContributor(
    vocab: string,
    contributor: FindOptionsWhere<User>
  ): Promise<Vocabulary | null> {
    const vocabulary = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { contributors: true },
    })
    const creator = await userRepo.findOne({ where: contributor })
    if (
      !vocabulary?.contributors.find(
        (contributor) => contributor.webId === creator?.webId
      )
    ) {
      vocabulary?.contributors.push(creator as User)
      await vocabulary?.save()
    }
    return vocabulary
  }

  async getAll(): Promise<Vocabulary[]> {
    const vocabularies = await vocabRepo.find({
      take: 10,
    })
    return vocabularies
  }

  async getOne(slug: string): Promise<Vocabulary | null> {
    const vocabulary = await vocabRepo.findOne({
      where: { slug },
      relations: {
        contributors: true,
        properties: true,
        classes: true,
      },
    })
    return vocabulary
  }

  async getProperties(slug: string): Promise<Property[]> {
    const properties = await propertiesRepo.find({
      where: { vocab: { slug } },
    })
    return properties
  }

  async getProperty(slug: string, propSlug: string): Promise<Property | null> {
    const prop = await propertiesRepo.findOne({
      where: {
        vocab: { slug },
        slug: propSlug,
      },
      relations: {
        vocab: { contributors: true },
      },
    })
    return prop
  }

  async getClasses(slug: string): Promise<RdfClass[]> {
    const classes = await rdfClassesRepo.find({
      where: { vocab: { slug } },
    })
    return classes
  }

  async getClass(slug: string, cls: string): Promise<RdfClass | null> {
    const rdfClass = await rdfClassesRepo.findOne({
      where: {
        vocab: { slug },
        slug: cls,
      },
      relations: {
        vocab: { contributors: true },
      },
    })
    return rdfClass
  }

  async create(
    name: string,
    creator: string,
    slug?: string,
    link?: string
  ): Promise<Vocabulary> {
    const vocabulary = await vocabRepo
      .create({
        name: name,
        slug: slug ?? toCamelCase(name),
        link,
      })
      .save()
    await this.addContributor(vocabulary.slug, { webId: creator })
    return (await this.getOne(vocabulary.slug)) as Vocabulary
  }

  async createFromLink(
    link: string,
    creator: string
  ): Promise<Vocabulary | null> {
    const extractedVocabulary = await extractVocabulary(link).catch(() => null)
    if (!extractedVocabulary) {
      return null
    }
    const vocabExists = !!(await this.getOne(extractedVocabulary.slug))
    if (vocabExists) {
      return null
    }
    const createdVocab = await this.create(
      extractedVocabulary.name,
      creator,
      extractedVocabulary.slug,
      extractedVocabulary.link
    )
    const rdfClasses = await Promise.all(
      extractedVocabulary.classes.map(async (cls: ExtractedClass) => {
        const [parentClassVocabLink, parentClass] = cls.inherits
          ? splitLinkIntoVocabAndMember(cls.inherits)
          : []
        const inherits =
          cls.inherits &&
          (await rdfClassesRepo.findOne({
            where: {
              slug: parentClass,
              vocab: { link: parentClassVocabLink },
            },
          }))
        return {
          ...cls,
          creator: { webId: creator },
          inherits: inherits || undefined,
        }
      })
    )
    await this._addExtractedClasses(createdVocab.slug, rdfClasses)
    const properties = await Promise.all(
      extractedVocabulary.properties.map(async (prop) => {
        const [domainVocabLink, domainClass] = prop.domain
          ? splitLinkIntoVocabAndMember(prop.domain)
          : [null, null]
        const domain =
          prop.domain &&
          domainVocabLink &&
          domainClass &&
          (await rdfClassesRepo.findOne({
            where: {
              vocab: { link: domainVocabLink },
              slug: domainClass,
            },
          }))
        const [rangeVocabLink, rangeClass] = prop.range
          ? splitLinkIntoVocabAndMember(prop.range)
          : [null, null]
        const range =
          prop.range &&
          rangeVocabLink &&
          rangeClass &&
          (await rdfClassesRepo.findOne({
            where: {
              vocab: { link: rangeVocabLink },
              slug: rangeClass,
            },
          }))
        return {
          name: prop.name,
          slug: prop.slug,
          domain: domain || undefined,
          range: range || undefined,
          creator: { webId: creator },
        }
      })
    )
    await this._addExtractedProperties(createdVocab.slug, properties)
    await this.addContributor(createdVocab.slug, { webId: creator })
    return (await this.getOne(createdVocab.slug)) as Vocabulary
  }

  async createProperty(
    vocab: string,
    params: PropertyCreationParams
  ): Promise<Property | string> {
    const editedVocab = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { contributors: true },
    })
    if (!editedVocab) {
      return ErrorMessages.VOCAB_NOT_FOUND
    }
    const property = await propertiesRepo
      .create({
        name: params.name,
        slug: params.slug ?? toCamelCase(params.name),
        vocab: editedVocab as Vocabulary,
        domain: params.domain ?? undefined,
        range: params.range ?? undefined,
      })
      .save()

    await this.addContributor(vocab, params.creator)
    return (await this.getProperty(vocab, property.slug)) as Property
  }

  async createClass(
    vocab: string,
    params: ClassCreationParams
  ): Promise<RdfClass | string> {
    const editedVocab = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { contributors: true },
    })
    if (!editedVocab) {
      return ErrorMessages.VOCAB_NOT_FOUND
    }
    console.debug(params.inherits)
    const createdCls = await rdfClassesRepo
      .create({
        name: params.name,
        slug: params.slug ?? toPascalCase(params.name),
        vocab: editedVocab as Vocabulary,
        inherits: params.inherits ?? undefined,
      })
      .save()

    await this.addContributor(vocab, params.creator)
    return (await this.getClass(vocab, createdCls.slug)) as RdfClass
  }

  async update(
    slug: string,
    webId: string,
    params: VocabularyUpdateParams
  ): Promise<Vocabulary> {
    await vocabRepo.update({ slug }, params)

    await this.addContributor(slug, { webId })
    return (await this.getOne(slug)) as Vocabulary
  }

  async updateProperty(
    vocab: string,
    slug: string,
    webId: string,
    params: PropertyUpdateParams
  ): Promise<Property> {
    const vocabulary = await this.getOne(vocab)
    await propertiesRepo.update({ slug, vocab: { id: vocabulary?.id } }, params)

    await this.addContributor(vocab, { webId })
    return (await this.getProperty(vocab, slug)) as Property
  }

  async updateClass(
    vocab: string,
    slug: string,
    webId: string,
    params: ClassUpdateParams
  ): Promise<RdfClass> {
    const vocabulary = await this.getOne(vocab)
    await rdfClassesRepo.update({ slug, vocab: { id: vocabulary?.id } }, params)

    await this.addContributor(vocab, { webId })
    return (await this.getClass(vocab, slug)) as RdfClass
  }

  async delete(slug: string): Promise<boolean> {
    await vocabRepo.delete({ slug })

    return true
  }

  async deleteProperty(vocab: string, slug: string): Promise<boolean> {
    const vocabulary = await this.getOne(vocab)
    await propertiesRepo.delete({ slug, vocab: { id: vocabulary?.id } })

    return true
  }

  async deleteClass(vocab: string, slug: string): Promise<boolean> {
    const vocabulary = await this.getOne(vocab)
    await rdfClassesRepo.delete({ slug, vocab: { id: vocabulary?.id } })

    return true
  }
}
