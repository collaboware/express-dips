import { Repository } from 'typeorm'

import { IPSDataSource } from '../../datasource'
import { seed } from '../../seed'
import { testUserWebId } from '../../seed/user'
import { Vocabulary } from '../model'
import { VocabularyService } from '../service'

let vocabs: VocabularyService
let vocabRepo: Repository<Vocabulary>

beforeAll(async () => {
  await seed(true)
  vocabRepo = IPSDataSource.getRepository<Vocabulary>('Vocabulary')
  vocabs = new VocabularyService()
})

describe('Get Methods', () => {
  it('should list all vocabs', async () => {
    const vocabularies = await vocabs.getAll()
    expect(vocabularies).toBeDefined()
    expect(vocabularies).toHaveLength(1)
  })

  it('should list one vocab', async () => {
    const vocabulary = await vocabs.getOne('foaf')
    expect(!!vocabulary).toBeTruthy()
    expect(vocabulary?.name).toBe('Friend of a friend')
    expect(vocabulary?.slug).toBe('foaf')
  })

  it('should list all properties of vocab', async () => {
    const properties = await vocabs.getProperties('foaf')
    expect(!!properties).toBeTruthy()
    expect(properties).toHaveLength(1)
  })

  it('should list all classes of vocab', async () => {
    const classes = await vocabs.getClasses('foaf')
    expect(!!classes).toBeTruthy()
    expect(classes).toHaveLength(1)
  })
})

describe('Create Methods', () => {
  it('should create a new vocab', async () => {
    const name = 'Solid Terms'
    const slug = 'solid'
    const vocabulary = await vocabs.create(name, testUserWebId, slug)
    expect(!!vocabulary).toBeTruthy()
    expect(vocabulary?.name).toBe(name)
    expect(vocabulary?.slug).toBe(slug)
    const createdVocabulary = await vocabRepo.findOne({
      where: { slug: 'solid' },
      relations: { contributors: true },
    })
    expect(
      createdVocabulary?.contributors.find(
        (user) => user.webId === testUserWebId
      )
    ).toBeTruthy()
  })

  it('should use name as default slug', async () => {
    const name = 'Solid Terms'
    const vocabulary = await vocabs.create(name, testUserWebId)
    expect(!!vocabulary).toBeTruthy()
    expect(vocabulary?.name).toBe(name)
    expect(vocabulary?.slug).toBe('solidTerms')
  })

  it('should create a new class in a vocab', async () => {
    const vocab = 'solid'
    const classname = 'Account'
    const creatorWebId = testUserWebId.replace('tester', 'tester2')
    const createdClass = await vocabs.createClass(vocab, {
      name: classname,
      creator: { webId: creatorWebId },
    })
    expect(!!createdClass).toBeTruthy()
    expect(createdClass?.name).toBe(classname)
    expect(createdClass?.slug).toBe(classname)
    const vocabulary = await vocabRepo.findOne({
      where: { slug: 'solid' },
      relations: { contributors: true },
    })
    expect(
      vocabulary?.contributors.find((user) => user.webId === creatorWebId)
    ).toBeTruthy()
  })

  it('should create a new property in a vocab', async () => {
    const vocab = 'solid'
    const property = 'notification'
    const creatorWebId = testUserWebId.replace('tester', 'tester3')
    const createdProperty = await vocabs.createProperty(vocab, {
      name: property,
      creator: { webId: creatorWebId },
    })
    expect(!!createdProperty).toBeTruthy()
    expect(createdProperty?.name).toBe(property)
    expect(createdProperty?.slug).toBe(property)
    const vocabulary = await vocabRepo.findOne({
      where: { slug: 'solid' },
      relations: { contributors: true },
    })
    expect(
      vocabulary?.contributors.find((user) => user.webId === creatorWebId)
    ).toBeTruthy()
  })
})
