import request from 'supertest'

import { seed } from '../../seed'
import { testUserWebId } from '../../seed/user'
import { server } from '../../server'
import { User } from '../../User/model'
import { TestUtils } from '../../utils'
import { ErrorMessages } from '../service'

describe('Get Endpoints', () => {
  beforeAll(async () => {
    await seed(true)
  })

  it('should list all vocabs', async () => {
    const res = await request(server).get('/api/vocabs').send()
    expect(res.statusCode).toEqual(200)
    expect(res.body.length).toEqual(1)
  })

  it('should return one vocab', async () => {
    const res = await request(server).get('/api/vocabs/foaf').send()
    expect(res.statusCode).toEqual(200)
    expect(res.body.name).toEqual('Friend of a friend')
  })

  it('should return all properties', async () => {
    const res = await request(server).get('/api/vocabs/foaf/properties').send()
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveLength(1)
  })

  it('should return one property', async () => {
    const res = await request(server).get('/api/vocabs/foaf/name').send()
    expect(res.statusCode).toEqual(200)
    expect(res.body.name).toBe('name')
    expect(res.body.slug).toBe('name')
  })

  it('should return 404 for nonexisting property', async () => {
    const res = await request(server).get('/api/vocabs/foaf/lala').send()
    expect(res.statusCode).toEqual(404)
    expect(JSON.stringify(res.body)).toEqual('{}')
  })

  it('should return all classes', async () => {
    const res = await request(server).get('/api/vocabs/foaf/classes').send()
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveLength(1)
  })

  it('should return one class', async () => {
    const res = await request(server).get('/api/vocabs/foaf/Agent').send()
    expect(res.statusCode).toEqual(200)
    expect(res.body.name).toBe('Agent')
    expect(res.body.slug).toBe('Agent')
  })
})

describe('Post Endpoints', () => {
  it('should create a vocab', async () => {
    const res = await TestUtils.requestAs(
      request(server)
        .post('/api/vocabs/')
        .send({ name: 'Solid Terms', slug: 'solid' }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual('Solid Terms')
    expect(res.body.slug).toEqual('solid')
    expect(
      !!res.body.contributors.find((user: User) => user.webId === testUserWebId)
    ).toBeTruthy()
  })

  it('should create a vocab from a link', async () => {
    const link = 'http://www.w3.org/2000/01/rdf-schema'
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/').send({ link }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual('The RDF Schema vocabulary (RDFS)')
    expect(
      !!res.body.contributors.find((user: User) => user.webId === testUserWebId)
    ).toBeTruthy()
  }, 10000)

  it('should not create a vocab from a link twice', async () => {
    const link = 'http://www.w3.org/2000/01/rdf-schema'
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/').send({ link }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(403)
    expect(JSON.stringify(res.body)).toEqual('{}')
  }, 10000)

  it('should not create a vocab from a bad link', async () => {
    const link = 'http://www.w3.org/2000/01/rdf-schemaasdfsdf'
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/').send({ link }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(403)
  }, 10000)

  it('should not create a vocab from a bad link', async () => {
    const link = 'https://dbpedia.org/page/Leonardo_da_Vinci'
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/').send({ link }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(403)
  }, 20000)

  it('should create a class in a vocab', async () => {
    const cls = 'Account'
    const creator = testUserWebId
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/solid/classes').send({ name: cls }),
      creator
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(cls)
    expect(res.body.slug).toEqual(cls)
    expect(
      !!res.body.vocab.contributors.find((user: User) => user.webId === creator)
    ).toBeTruthy()
  })

  it('should not create a class in a non-existing vocab', async () => {
    const cls = 'Account'
    const creator = testUserWebId
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/asdf/classes').send({ name: cls }),
      creator
    )
    expect(res.statusCode).toEqual(404)
    expect(res.body).toEqual(ErrorMessages.VOCAB_NOT_FOUND)
  })

  it('should create a property in a vocab', async () => {
    const prop = 'notification'
    const creator = testUserWebId.replace('tester', 'tester3')
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/solid/properties').send({ name: prop }),
      creator
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(prop)
    expect(res.body.slug).toEqual(prop)
    expect(
      !!res.body.vocab.contributors.find((user: User) => user.webId === creator)
    ).toBeTruthy()
  })

  it('should not create a property in a nonexisting vocab', async () => {
    const prop = 'notification'
    const creator = testUserWebId.replace('tester', 'tester3')
    const res = await TestUtils.requestAs(
      request(server).post('/api/vocabs/asdf/properties').send({ name: prop }),
      creator
    )
    expect(res.statusCode).toEqual(404)
    expect(res.body).toEqual(ErrorMessages.VOCAB_NOT_FOUND)
  })

  it('should update a vocab', async () => {
    const vocab = 'solid'
    const name = 'Solid Terms (2)'
    const description = 'Solid Terms (2)'
    const webId = testUserWebId.replace('tester', 'tester4')
    const res = await TestUtils.requestAs(
      request(server).post(`/api/vocabs/${vocab}`).send({ name, description }),
      webId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(name)
    expect(res.body.slug).toEqual(vocab)
    expect(
      !!res.body.contributors.find((user: User) => user.webId === webId)
    ).toBeTruthy()
  })

  it('should update a class', async () => {
    const vocab = 'solid'
    const cls = 'Account'
    const clsName = 'Account (2)'
    const description = 'Account (2)'
    const webId = testUserWebId.replace('tester', 'tester5')
    const res = await TestUtils.requestAs(
      request(server)
        .post(`/api/vocabs/${vocab}/${cls}`)
        .send({ name: clsName, description }),
      webId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(clsName)
    expect(res.body.slug).toEqual(cls)
    expect(res.body.vocab.slug).toEqual(vocab)
    expect(
      !!res.body.vocab.contributors.find((user: User) => user.webId === webId)
    ).toBeTruthy()
  })

  it('should update a property', async () => {
    const vocab = 'solid'
    const webId = testUserWebId.replace('tester', 'tester6')
    const prop = 'notification'
    const propName = 'Notification'
    const description = 'Notification'
    const res = await TestUtils.requestAs(
      request(server)
        .post(`/api/vocabs/${vocab}/${prop}`)
        .send({ name: propName, description }),
      webId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(propName)
    expect(res.body.slug).toEqual(prop)
    expect(res.body.vocab.slug).toEqual(vocab)
    expect(
      !!res.body.vocab.contributors.find((user: User) => user.webId === webId)
    ).toBeTruthy()
  })

  it('should fail updating a nonexistent property', async () => {
    const vocab = 'solid'
    const webId = testUserWebId.replace('tester', 'tester6')
    const prop = 'notificationzzz'
    const propName = 'Notification'
    const res = await TestUtils.requestAs(
      request(server)
        .post(`/api/vocabs/${vocab}/${prop}`)
        .send({ name: propName }),
      webId
    )
    expect(res.statusCode).toEqual(404)
  })
})

describe('Delete Endpoints', () => {
  it('should delete a vocab', async () => {
    const vocab = 'solid'
    const webId = testUserWebId.replace('tester', 'tester4')
    const res = await TestUtils.requestAs(
      request(server).delete(`/api/vocabs/${vocab}`).send(),
      webId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body).toBeTruthy()
  })

  it('should delete a class', async () => {
    const vocab = 'foaf'
    const cls = 'Agent'
    const webId = testUserWebId.replace('tester', 'tester5')
    const res = await TestUtils.requestAs(
      request(server).delete(`/api/vocabs/${vocab}/${cls}`).send(),
      webId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body).toBeTruthy()
  })

  it('should delete a property', async () => {
    const vocab = 'foaf'
    const prop = 'name'
    const webId = testUserWebId.replace('tester', 'tester6')
    const res = await TestUtils.requestAs(
      request(server).delete(`/api/vocabs/${vocab}/${prop}`).send(),
      webId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body).toBeTruthy()
  })

  it('should fail deleting a nonexistent property', async () => {
    const vocab = 'solid'
    const webId = testUserWebId.replace('tester', 'tester6')
    const prop = 'notificationzzz'
    const res = await TestUtils.requestAs(
      request(server).delete(`/api/vocabs/${vocab}/${prop}`).send(),
      webId
    )
    expect(res.statusCode).toEqual(404)
    expect(res.body).toBeFalsy()
  })
})
