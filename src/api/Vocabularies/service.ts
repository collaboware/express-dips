import { toCamelCase, toPascalCase } from 'js-convert-case'
import { FindOptionsWhere } from 'typeorm'

import { IPSDataSource } from '../datasource'
import { User } from '../User/model'

import {
  Property,
  PropertyCreationParams,
  RdfClass,
  ClassCreationParams,
  Vocabulary,
} from './model'

const userRepo = IPSDataSource.getRepository<User>('User')
const vocabRepo = IPSDataSource.getRepository<Vocabulary>('Vocabulary')
const rdfClassesRepo = IPSDataSource.getRepository<RdfClass>('RdfClass')
const propertiesRepo = IPSDataSource.getRepository<Property>('Property')

export class VocabularyService {
  async getAll(): Promise<Vocabulary[]> {
    const vocabularies = await vocabRepo.find({
      take: 10,
    })
    return vocabularies
  }

  async getOne(slug: string): Promise<Vocabulary | null> {
    const vocabulary = await vocabRepo.findOne({
      where: { slug },
    })
    return vocabulary
  }

  async getProperties(slug: string): Promise<Property[]> {
    const properties = await propertiesRepo.find({
      where: { vocab: { slug } },
    })
    return properties
  }

  async getClasses(slug: string): Promise<RdfClass[]> {
    const classes = await rdfClassesRepo.find({
      where: { vocab: { slug } },
    })
    return classes
  }

  async create(
    name: string,
    creator: string,
    slug?: string
  ): Promise<Vocabulary> {
    const vocabulary = await vocabRepo
      .create({
        name: name,
        slug: slug ?? toCamelCase(name),
      })
      .save()
    await this.addContributor(vocabulary.slug, { webId: creator })
    return vocabulary
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

  async createProperty(
    vocab: string,
    params: PropertyCreationParams
  ): Promise<Property> {
    const editedVocab = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { contributors: true },
    })
    const property = await propertiesRepo
      .create({
        name: params.name,
        slug: params.slug ?? toCamelCase(params.name),
        domain: params.domain ? { slug: params.domain } : undefined,
        range: params.range ? { slug: params.range } : undefined,
        vocab: editedVocab as Vocabulary,
      })
      .save()

    await this.addContributor(vocab, params.creator)
    return property
  }

  async createClass(
    vocab: string,
    params: ClassCreationParams
  ): Promise<Property | RdfClass> {
    const editedVocab = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { contributors: true },
    })
    const createdClass = await rdfClassesRepo
      .create({
        name: params.name,
        slug: params.slug ?? toPascalCase(params.name),
        inherits: { slug: (params as ClassCreationParams).inherits },
        vocab: editedVocab as Vocabulary,
      })
      .save()

    await this.addContributor(vocab, params.creator)
    return createdClass
  }
}
