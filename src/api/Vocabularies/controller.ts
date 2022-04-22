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
} from 'tsoa'

import {
  ClassCreationParams,
  Property,
  PropertyCreationParams,
  RdfClass,
  Vocabulary,
  VocabularyCreationParams,
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
  ): Promise<Vocabulary> {
    this.setStatus(201)
    const vocabulary = await vocabs.create(
      vocab.name,
      request.res?.locals.session?.info.webId as string,
      vocab.slug
    )
    return vocabulary
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('{vocab}/properties')
  public async createProperty(
    @Path() vocab: string,
    @Body() requestBody: Omit<PropertyCreationParams, 'creator'>,
    @Request() request: express.Request
  ): Promise<Property | RdfClass> {
    this.setStatus(201)
    const createdProperty = vocabs.createProperty(vocab, {
      ...requestBody,
      creator: {
        webId: request.res?.locals.session?.info.webId as string,
      },
    })
    return createdProperty
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('{vocab}/classes')
  public async createClass(
    @Path() vocab: string,
    @Body() requestBody: Omit<ClassCreationParams, 'creator'>,
    @Request() request: express.Request
  ): Promise<Property | RdfClass> {
    this.setStatus(201)
    const createdProperty = vocabs.createClass(vocab, {
      ...requestBody,
      creator: {
        webId: request.res?.locals.session?.info.webId as string,
      },
    })
    return createdProperty
  }
}
