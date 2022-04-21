import { DataSource, DeepPartial } from 'typeorm'

import { Property, Vocabulary } from '../Vocabularies/model'

const properties: DeepPartial<Property>[] = [
  {
    name: 'name',
    slug: 'name',
    description: 'A name for some thing.',
  },
]

export const seedProperties = async (
  db: DataSource,
  vocab: Vocabulary
): Promise<void> => {
  const propertiesRepo = db.getRepository<Property>('Property')
  await propertiesRepo.save(
    properties.map((property) => ({ ...property, vocab: vocab }))
  )
}
