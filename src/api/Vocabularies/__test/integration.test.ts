import request from 'supertest'

import { seed } from '../../seed'
import { testUserWebId } from '../../seed/user'
import { server } from '../../server'
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
  })

  it('should create a class in a vocab', async () => {
    const className = 'Account'
    const res = await TestUtils.requestAs(
      request(server)
        .post('/api/vocabs/solid/classes')
        .send({ name: className }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(className)
    expect(res.body.slug).toEqual(className)
  })

  it('should create a property in a vocab', async () => {
    const propertyName = 'notification'
    const res = await TestUtils.requestAs(
      request(server)
        .post('/api/vocabs/solid/properties')
        .send({ name: propertyName }),
      testUserWebId
    )
    expect(res.statusCode).toEqual(201)
    expect(res.body.name).toEqual(propertyName)
    expect(res.body.slug).toEqual(propertyName)
  })
})
