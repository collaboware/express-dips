import express from 'express'
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Route,
  Request,
  Security,
  SuccessResponse,
  Delete,
} from 'tsoa'

import {
  ClassCreationParams,
  ClassUpdateParams,
  Property,
  PropertyCreationParams,
  PropertyUpdateParams,
  RdfClass,
  Vocabulary,
  VocabularyCreationParams,
  VocabularyUpdateParams,
} from './model'
import { VocabularyService } from './service'

const vocabs = new VocabularyService()
@Route('vocabs')
export class VocabulariesController extends Controller {
  @Get('')
  public async getVocabs(): Promise<Vocabulary[]> {
    this.setStatus(200) // set return status 200
    return await vocabs.getAll()
  }

  @Get('{vocab}')
  public async getVocab(@Path() vocab: string): Promise<Vocabulary | null> {
    this.setStatus(200) // set return status 200
    return await vocabs.getOne(vocab)
  }

  @Get('{vocab}/properties')
  public async getProperties(@Path() vocab: string): Promise<Property[]> {
    this.setStatus(200) // set return status 200
    return await vocabs.getProperties(vocab)
  }

  @Get('{vocab}/classes')
  public async getClasses(@Path() vocab: string): Promise<Property[]> {
    this.setStatus(200) // set return status 200
    return await vocabs.getClasses(vocab)
  }

  @Get('{vocab}/{propertyOrClass}')
  public async getPropertyOrClass(
    @Path() vocab: string,
    @Path() propertyOrClass: string
  ): Promise<Property | RdfClass | null> {
    this.setStatus(200)
    const property = await vocabs.getProperty(vocab, propertyOrClass)
    if (property) {
      return property
    }
    const rdfClass = await vocabs.getClass(vocab, propertyOrClass)
    if (rdfClass) {
      return rdfClass
    }
    this.setStatus(404)
    return null
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('')
  public async createVocab(
    @Body() vocab: Omit<VocabularyCreationParams, 'creator'>,
    @Request() request: express.Request
  ): Promise<Vocabulary | null> {
    this.setStatus(201)
    if (vocab.name && vocab.slug) {
      const vocabulary = await vocabs.create(
        vocab.name,
        request.res?.locals.session?.info.webId as string,
        vocab.slug
      )
      return vocabulary
    } else if (vocab.link) {
      const vocabulary = await vocabs.createFromLink(
        vocab.link,
        request.res?.locals.session?.info.webId as string
      )
      if (vocabulary) return vocabulary
    }
    this.setStatus(403)
    return null
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('{vocab}/properties')
  public async createProperty(
    @Path() vocab: string,
    @Body() requestBody: Omit<PropertyCreationParams, 'creator'>,
    @Request() request: express.Request
  ): Promise<Property | RdfClass | string> {
    this.setStatus(201)
    const createdProperty = await vocabs.createProperty(vocab, {
      ...requestBody,
      creator: {
        webId: request.res?.locals.session?.info.webId as string,
      },
    })
    if (typeof createdProperty === 'string') {
      this.setStatus(404)
    }
    return createdProperty
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('{vocab}/classes')
  public async createClass(
    @Path() vocab: string,
    @Body() requestBody: Omit<ClassCreationParams, 'creator'>,
    @Request() request: express.Request
  ): Promise<Property | RdfClass | string> {
    this.setStatus(201)
    const createdProperty = await vocabs.createClass(vocab, {
      ...requestBody,
      creator: {
        webId: request.res?.locals.session?.info.webId as string,
      },
    })
    if (typeof createdProperty === 'string') {
      this.setStatus(404)
    }
    return createdProperty
  }

  @SuccessResponse('201', 'Updated') // Custom success response
  @Security('cookie')
  @Post('{vocab}')
  public async updateVocab(
    @Path() vocab: string,
    @Body() body: VocabularyUpdateParams,
    @Request() request: express.Request
  ): Promise<Vocabulary> {
    this.setStatus(201)
    const vocabulary = await vocabs.update(
      vocab,
      request.res?.locals.session?.info.webId as string,
      body
    )
    return vocabulary
  }

  @SuccessResponse('201', 'Updated') // Custom success response
  @Security('cookie')
  @Post('{vocab}/{propertyOrClass}')
  public async updatePropertyOrClass(
    @Path() vocab: string,
    @Path() propertyOrClass: string,
    @Body() body: PropertyUpdateParams | ClassUpdateParams,
    @Request() request: express.Request
  ): Promise<Property | RdfClass | null> {
    this.setStatus(201)
    const property = await vocabs.getProperty(vocab, propertyOrClass)
    if (property) {
      const updatedProperty = await vocabs.updateProperty(
        vocab,
        propertyOrClass,
        request.res?.locals.session.info.webId,
        body
      )
      return updatedProperty
    }
    const rdfClass = await vocabs.getClass(vocab, propertyOrClass)
    if (rdfClass) {
      const updatedClass = await vocabs.updateClass(
        vocab,
        propertyOrClass,
        request.res?.locals.session.info.webId,
        body
      )
      return updatedClass
    }
    this.setStatus(404)
    return null
  }

  @SuccessResponse('201', 'Deleted') // Custom success response
  @Security('cookie')
  @Delete('{vocab}')
  public async deleteVocab(@Path() vocab: string): Promise<boolean> {
    this.setStatus(201)
    const vocabulary = await vocabs.delete(vocab)
    return vocabulary
  }

  @SuccessResponse('201', 'Deleted') // Custom success response
  @Security('cookie')
  @Delete('{vocab}/{propertyOrClass}')
  public async deletePropertyOrClass(
    @Path() vocab: string,
    @Path() propertyOrClass: string
  ): Promise<boolean> {
    this.setStatus(201)
    const property = await vocabs.getProperty(vocab, propertyOrClass)
    if (property) {
      const deletedProperty = await vocabs.deleteProperty(
        vocab,
        propertyOrClass
      )
      return deletedProperty
    }
    const rdfClass = await vocabs.getClass(vocab, propertyOrClass)
    if (rdfClass) {
      const deletedClass = await vocabs.deleteClass(vocab, propertyOrClass)
      return deletedClass
    }
    this.setStatus(404)
    return false
  }
}
