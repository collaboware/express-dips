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

  it('should get one property of vocab', async () => {
    const prop = 'name'
    const property = await vocabs.getProperty('foaf', prop)
    expect(!!property).toBeTruthy()
    expect(property?.name).toBe(prop)
    expect(property?.slug).toBe(prop)
  })

  it('should list all classes of vocab', async () => {
    const classes = await vocabs.getClasses('foaf')
    expect(!!classes).toBeTruthy()
    expect(classes).toHaveLength(1)
  })

  it('should get one class of vocab', async () => {
    const cl = 'Agent'
    const rdfClass = await vocabs.getClass('foaf', cl)
    expect(!!rdfClass).toBeTruthy()
    expect(rdfClass?.name).toBe(cl)
    expect(rdfClass?.slug).toBe(cl)
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
    const vocab = 'foaf'
    const classname = 'Person'
    const creatorWebId = testUserWebId.replace('tester', 'tester2')
    const createdClass = await vocabs.createClass(vocab, {
      name: classname,
      creator: { webId: creatorWebId },
    })
    expect(!!createdClass).toBeTruthy()
    expect(createdClass?.name).toBe(classname)
    expect(createdClass?.slug).toBe(classname)
    const vocabulary = await vocabRepo.findOne({
      where: { slug: 'foaf' },
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

describe('Update Methods', () => {
  it('should update a vocab', async () => {
    const name = 'Solid Terms (2)'
    const slug = 'solid'
    const webId = testUserWebId.replace('tester', 'tester4')
    const vocabulary = await vocabs.update(slug, webId, { name })
    expect(!!vocabulary).toBeTruthy()
    expect(vocabulary?.name).toBe(name)
    expect(vocabulary?.slug).toBe(slug)
    const updatedVocabulary = await vocabRepo.findOne({
      where: { slug: 'solid' },
      relations: { contributors: true },
    })
    expect(
      updatedVocabulary?.contributors.find((user) => user.webId === webId)
    ).toBeTruthy()
  })

  it('should update a class', async () => {
    const vocab = 'foaf'
    const classname = 'Person'
    const newClassname = classname + ' (2)'
    const creatorWebId = testUserWebId.replace('tester', 'tester5')
    const updatedClass = await vocabs.updateClass(
      vocab,
      classname,
      creatorWebId,
      {
        name: newClassname,
      }
    )
    expect(!!updatedClass).toBeTruthy()
    expect(updatedClass?.name).toBe(newClassname)
    expect(updatedClass?.slug).toBe(classname)
    const vocabulary = await vocabRepo.findOne({
      where: { slug: 'foaf' },
      relations: { contributors: true },
    })
    expect(
      vocabulary?.contributors.find((user) => user.webId === creatorWebId)
    ).toBeTruthy()
  })

  it('should update a property', async () => {
    const vocab = 'solid'
    const property = 'notification'
    const newPropertyName = 'Notification'
    const webId = testUserWebId.replace('tester', 'tester6')
    const updatedProperty = await vocabs.updateProperty(
      vocab,
      property,
      webId,
      {
        name: newPropertyName,
      }
    )
    expect(!!updatedProperty).toBeTruthy()
    expect(updatedProperty?.name).toBe(newPropertyName)
    expect(updatedProperty?.slug).toBe(property)
    const vocabulary = await vocabRepo.findOne({
      where: { slug: 'solid' },
      relations: { contributors: true },
    })
    expect(
      vocabulary?.contributors.find((user) => user.webId === webId)
    ).toBeTruthy()
  })
})

describe('Delete Methods', () => {
  it('should delete a vocab', async () => {
    const slug = 'solid'
    const vocabulary = await vocabs.delete(slug)
    expect(vocabulary).toBeTruthy()
    const deletedVocabulary = await vocabRepo.findOne({
      where: { slug: 'solid' },
      relations: { contributors: true },
    })
    expect(deletedVocabulary).toBeNull()
  })

  it('should delete a class', async () => {
    const vocab = 'foaf'
    const cls = 'Person'
    const deletedClass = await vocabs.deleteClass(vocab, cls)
    expect(deletedClass).toBeTruthy()
    const vocabulary = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { classes: true },
    })
    expect(
      !vocabulary?.classes.find((rdfClass) => rdfClass.slug === cls)
    ).toBeTruthy()
  })

  it('should delete a property', async () => {
    const vocab = 'foaf'
    const prop = 'name'
    const deletedClass = await vocabs.deleteProperty(vocab, prop)
    expect(deletedClass).toBeTruthy()
    const vocabulary = await vocabRepo.findOne({
      where: { slug: vocab },
      relations: { properties: true },
    })
    expect(
      !vocabulary?.properties.find((property) => property.slug === prop)
    ).toBeTruthy()
  })
})
