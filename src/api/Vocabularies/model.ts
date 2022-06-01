import {
  BaseEntity,
  Column,
  DeepPartial,
  Entity,
  FindOptionsWhere,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from '../User/model'

export enum XSD_DATATYPES {
  string = 'http://www.w3.org/2001/XMLSchema#string',
  ENTITIES = 'http://www.w3.org/2001/XMLSchema#ENTITIES',
  ENTITY = 'http://www.w3.org/2001/XMLSchema#ENTITY',
  ID = 'http://www.w3.org/2001/XMLSchema#ID',
  IDREF = 'http://www.w3.org/2001/XMLSchema#IDREF',
  IDREFS = 'http://www.w3.org/2001/XMLSchema#IDREFS',
  language = 'http://www.w3.org/2001/XMLSchema#language',
  Name = 'http://www.w3.org/2001/XMLSchema#Name',
  NCName = 'http://www.w3.org/2001/XMLSchema#NCName',
  NMTOKEN = 'http://www.w3.org/2001/XMLSchema#NMTOKEN',
  NMTOKENS = 'http://www.w3.org/2001/XMLSchema#NMTOKENS',
  normalizedString = 'http://www.w3.org/2001/XMLSchema#normalizedString',
  QName = 'http://www.w3.org/2001/XMLSchema#QName',
  token = 'http://www.w3.org/2001/XMLSchema#token',
  date = 'http://www.w3.org/2001/XMLSchema#date',
  dateTime = 'http://www.w3.org/2001/XMLSchema#dateTime',
  duration = 'http://www.w3.org/2001/XMLSchema#duration',
  gDay = 'http://www.w3.org/2001/XMLSchema#gDay',
  gMonth = 'http://www.w3.org/2001/XMLSchema#gMonth',
  gMonthDay = 'http://www.w3.org/2001/XMLSchema#gMonthDay',
  gYear = 'http://www.w3.org/2001/XMLSchema#gYear',
  gYearMonth = 'http://www.w3.org/2001/XMLSchema#gYearMonth',
  time = 'http://www.w3.org/2001/XMLSchema#time',
  byte = 'http://www.w3.org/2001/XMLSchema#byte',
  decimal = 'http://www.w3.org/2001/XMLSchema#decimal',
  int = 'http://www.w3.org/2001/XMLSchema#int',
  integer = 'http://www.w3.org/2001/XMLSchema#integer',
  long = 'http://www.w3.org/2001/XMLSchema#long',
  negativeInteger = 'http://www.w3.org/2001/XMLSchema#negativeInteger',
  nonNegativeInteger = 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
  nonPositiveInteger = 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
  positiveInteger = 'http://www.w3.org/2001/XMLSchema#positiveInteger',
  short = 'http://www.w3.org/2001/XMLSchema#short',
  unsignedLong = 'http://www.w3.org/2001/XMLSchema#unsignedLong',
  unsignedInt = 'http://www.w3.org/2001/XMLSchema#unsignedInt',
  unsignedShort = 'http://www.w3.org/2001/XMLSchema#unsignedShort',
  unsignedByte = 'http://www.w3.org/2001/XMLSchema#unsignedByte',
  boolean = 'http://www.w3.org/2001/XMLSchema#boolean',
  hexBinary = 'http://www.w3.org/2001/XMLSchema#hexBinary',
  anyURI = 'http://www.w3.org/2001/XMLSchema#anyURI',
}

interface BaseCreationParams {
  creator: FindOptionsWhere<User>
}

export interface VocabularyCreationParams extends BaseCreationParams {
  name?: string
  slug?: string
  link?: string
}

export interface PropertyCreationParams extends BaseCreationParams {
  name: string
  slug?: string
  domain?: RdfClass
  range?: RdfClass
}

export interface ClassCreationParams extends BaseCreationParams {
  name: string
  slug?: string
  inherits?: RdfClass
}

export interface VocabularyUpdateParams {
  name?: string
  description?: string
  slug?: string
  link?: string
}

export interface PropertyUpdateParams {
  name?: string
  slug?: string
  description?: string
  domain?: DeepPartial<RdfClass>
  range?: DeepPartial<RdfClass>
}

export interface ClassUpdateParams {
  name?: string
  slug?: string
  description?: string
  inherits?: DeepPartial<RdfClass>
}

@Entity()
export class Vocabulary extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToMany(() => User)
  @JoinTable()
  contributors: User[]

  @OneToMany(() => RdfClass, (rdfClass: RdfClass) => rdfClass.vocab)
  classes: RdfClass[]

  @OneToMany(() => Property, (property: Property) => property.vocab)
  properties: Property[]

  @Column({ nullable: true })
  link?: string

  @Column()
  name: string

  @Column({ unique: true })
  slug: string

  @Column({ nullable: true })
  description?: string
}

@Entity()
export class RdfClass extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Vocabulary, (vocabulary: Vocabulary) => vocabulary.classes, {
    onDelete: 'CASCADE',
  })
  vocab: Vocabulary

  @OneToMany(() => Property, (property: Property) => property.domain)
  properties: Property[]

  @OneToOne(() => RdfClass)
  @JoinTable()
  inherits?: RdfClass

  @Column()
  name: string

  @Column({ unique: true })
  slug: string

  @Column({ nullable: true })
  description?: string
}

@Entity()
export class Property extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => RdfClass, (rdfClass: RdfClass) => rdfClass.properties)
  domain?: RdfClass

  @ManyToOne(() => RdfClass, (rdfClass: RdfClass) => rdfClass.properties)
  range?: RdfClass

  @ManyToOne(
    () => Vocabulary,
    (vocabulary: Vocabulary) => vocabulary.properties,
    {
      onDelete: 'CASCADE',
    }
  )
  vocab: Vocabulary

  @Column()
  name: string

  @Column({ unique: true })
  slug: string

  @Column({ nullable: true })
  description?: string
}
