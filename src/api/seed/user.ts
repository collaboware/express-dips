import { DataSource } from 'typeorm'

import { User } from '../User/model'

export const testUserWebId = 'https://solid.community/tester/profile/card#me'

const users: Partial<User>[] = [
  {
    name: 'Tester',
    webId: testUserWebId,
  },
  {
    name: 'Tester',
    webId: testUserWebId.replace('tester', 'tester2'),
  },
  {
    name: 'Tester',
    webId: testUserWebId.replace('tester', 'tester3'),
  },
]

export const seedUser = async (db: DataSource): Promise<User[]> => {
  const userRepo = db.getRepository<User>('User')
  const seedUsers = await userRepo.save(users)
  return seedUsers
}
