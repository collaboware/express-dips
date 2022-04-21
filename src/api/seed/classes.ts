import { DataSource, DeepPartial } from 'typeorm'

import { RdfClass, Vocabulary } from '../Vocabularies/model'

const classes: DeepPartial<RdfClass>[] = [
  {
    name: 'Agent',
    slug: 'Agent',
    description: 'An agent (eg. person, group, software or physical artifact).',
  },
]

export const seedClasses = async (
  db: DataSource,
  vocab: Vocabulary
): Promise<void> => {
  const classesRepo = db.getRepository<RdfClass>('RdfClass')
  await classesRepo.save(
    classes.map((rdfClass) => ({ ...rdfClass, vocab: vocab }))
  )
}
