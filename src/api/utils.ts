import { DataSource } from 'typeorm'
import request from 'supertest'

export class TestUtils {
  static async resetDatabase(db: DataSource): Promise<void> {
    await db.synchronize(true)
  }

  static requestAs(request: request.Request, webId: string): request.Request {
    return request.set('test-webid', webId)
  }
}
