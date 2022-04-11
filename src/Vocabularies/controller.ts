import { Session } from '@inrupt/solid-client-authn-node'
import express from 'express'
import { toCamelCase, toHeaderCase } from 'js-convert-case'
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

import { IPSDataSource } from '../datasource'

import {
  ClassCreationParams,
  Property,
  PropertyCreationParams,
  RdfClass,
  Vocabulary,
} from './model'

const vocabRepo = IPSDataSource.getRepository<Vocabulary>('Vocabulary')
const rdfClassesRepo = IPSDataSource.getRepository<RdfClass>('RdfClass')
const propertiesRepo = IPSDataSource.getRepository<Property>('Property')

@Route('vocabs')
export class VocabulariesController extends Controller {
  @Get('')
  public async getVocabs(): Promise<Vocabulary[]> {
    this.setStatus(200) // set return status 200
    const vocabularies = await vocabRepo.find({
      take: 10,
    })
    return vocabularies
  }

  @Security('cookie')
  @Get('{vocab}')
  public async getVocab(@Path() vocab: string): Promise<Vocabulary | null> {
    console.debug(vocab)
    this.setStatus(200) // set return status 200
    const vocabulary = await vocabRepo.findOneBy({
      slug: vocab,
    })
    return vocabulary
  }

  @Security('cookie')
  @Get('{vocab}/{propertyOrClass}')
  public async getPropertyOrClass(
    @Path() vocab: string,
    @Path() propertyOrClass: string
  ): Promise<void> {
    console.debug(vocab, propertyOrClass)
    this.setStatus(201)
    return
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('{vocab}')
  public async createVocab(
    @Path() vocab: string,
    @Request() request: express.Request
  ): Promise<Vocabulary> {
    const vocabulary = await vocabRepo.create({
      name: vocab,
      contributors: [
        { webId: (request as { session?: Session }).session?.info.webId },
      ],
    })
    this.setStatus(201)
    return vocabulary
  }

  @SuccessResponse('201', 'Created') // Custom success response
  @Security('cookie')
  @Post('{vocab}/{propertyOrClass}')
  public async createPropertyOrClass(
    @Path() vocab: string,
    @Path() propertyOrClass: string,
    @Body() requestBody: PropertyCreationParams | ClassCreationParams
  ): Promise<Property | RdfClass> {
    if ((requestBody as PropertyCreationParams).domain) {
      const property = await propertiesRepo.create({
        name: propertyOrClass,
        slug: toCamelCase(propertyOrClass),
        domain: { slug: (requestBody as PropertyCreationParams).domain },
      })
      this.setStatus(201)
      return property
    } else {
      const rdfClass = await rdfClassesRepo.create({
        name: propertyOrClass,
        slug: toHeaderCase(propertyOrClass),
        inherits: { slug: (requestBody as ClassCreationParams).inherits },
        vocab: { slug: vocab },
      })
      this.setStatus(201)
      return rdfClass
    }
  }
}
