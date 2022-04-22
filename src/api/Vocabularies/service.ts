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
  VocabularyUpdateParams,
  PropertyUpdateParams,
  ClassUpdateParams,
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
  ): Promise<RdfClass> {
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
