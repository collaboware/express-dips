import * as express from 'express'

import { sessionStorage } from './User/controller'

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'cookie') {
    if (scopes) console.debug('Not actively using scope authentication')
    const session = request.res?.locals.session
    if (!session?.info.isLoggedIn) {
      const response = request.res as express.Response
      sessionStorage.delete(request.signedCookies.session)

      // don't redirect api requests
      if (!request.url.startsWith('/api')) {
        response.redirect(`/api/user/login?redirect=${request.url}`)
      }
      return Promise.reject(Error('No active session was found.'))
    }
  }
  return Promise.resolve()
}
