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
      relations: { contributors: true },
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
    slug?: string
  ): Promise<Vocabulary> {
    const vocabulary = await vocabRepo
      .create({
        name: name,
        slug: slug ?? toCamelCase(name),
      })
      .save()
    await this.addContributor(vocabulary.slug, { webId: creator })
    return (await this.getOne(vocabulary.slug)) as Vocabulary
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
        vocab: editedVocab as Vocabulary,
      })
      .save()

    await this.addContributor(vocab, params.creator)
    return (await this.getProperty(vocab, property.slug)) as Property
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
        vocab: editedVocab as Vocabulary,
      })
      .save()

    await this.addContributor(vocab, params.creator)
    return (await this.getClass(vocab, createdClass.slug)) as RdfClass
  }
}
