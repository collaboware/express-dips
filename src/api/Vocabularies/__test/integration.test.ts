import request from 'supertest'

import { seed } from '../../seed'
import { testUserWebId } from '../../seed/user'
import { server } from '../../server'
import { User } from '../../User/model'
import { TestUtils } from '../../utils'

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

  it('should create a class in a vocab', async () => {
    const cls = 'Account'
    const creator = testUserWebId.replace('tester', 'tester2')
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
})
