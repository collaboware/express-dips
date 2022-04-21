import { IPSDataSource } from '../datasource'
import { TestUtils } from '../utils'

import { seedClasses } from './classes'
import { seedProperties } from './property'
import { seedUser } from './user'
import { seedVocabularies } from './vocabulary'

export const seed = async (reseed?: boolean): Promise<void> => {
  await IPSDataSource.initialize()
  if (reseed) {
    await TestUtils.resetDatabase(IPSDataSource)
    await IPSDataSource.runMigrations()
  }
  const users = await seedUser(IPSDataSource)
  const vocabularies = await seedVocabularies(IPSDataSource, users[0])
  await seedProperties(IPSDataSource, vocabularies[0])
  await seedClasses(IPSDataSource, vocabularies[0])
  console.debug('Finished Seeding!')
}
