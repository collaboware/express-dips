import { DataSource } from 'typeorm'

import { User } from '../User/model'
import { Vocabulary } from '../Vocabularies/model'

const vocabularies: Partial<Vocabulary>[] = [
  {
    name: 'Friend of a friend',
    description:
      'The Friend of a Friend (FOAF) RDF vocabulary, described using W3C RDF Schema and the Web Ontology Language.',
    slug: 'foaf',
    link: 'http://xmlns.com/foaf/spec/index.rdf',
    classes: [],
    properties: [],
  },
]

export const seedVocabularies = async (
  db: DataSource,
  user: User
): Promise<Vocabulary[]> => {
  const vocabRepo = db.getRepository<Vocabulary>('Vocabulary')
  return await vocabRepo.save(
    vocabularies.map((vocab) => ({ ...vocab, contributors: [user] }))
  )
}
