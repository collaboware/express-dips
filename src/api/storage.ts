import { IStorage } from '@inrupt/solid-client-authn-node'
import { Repository } from 'typeorm'

import { IPSDataSource } from './datasource'
import { UserSession } from './User/model'

export class SessionStorage implements IStorage {
  sessionRepo: Repository<UserSession>
  constructor(sessionRepo: Repository<UserSession>) {
    this.sessionRepo = sessionRepo
  }

  async get(key: string): Promise<string | undefined> {
    const session = await this.sessionRepo.findOne({
      where: { id: key },
    })
    // console.debug('[GETTING]', key, session)
    return session?.session
  }

  async set(key: string, value: string): Promise<void> {
    // console.debug('[SETTING]', key, value)
    key = key.endsWith('/') ? key.substring(0, key.length - 1) : key
    let userSession = await this.sessionRepo.findOne({
      where: { id: key },
    })
    if (userSession) {
      userSession.session = value
      await userSession.save()
    } else {
      userSession = new UserSession()
      userSession.id = key
      userSession.session = value
      await userSession.save()
    }
    return Promise.resolve()
  }

  async delete(key: string): Promise<void> {
    const userSession = await this.sessionRepo.findOne({
      where: { id: key },
    })
    await userSession?.remove()
    return Promise.resolve()
  }
}

export const sessionStorage = new SessionStorage(
  IPSDataSource.getRepository<UserSession>('UserSession')
)
