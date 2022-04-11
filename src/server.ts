import 'reflect-metadata'
import express, { Response, Request, CookieOptions } from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { getSessionFromStorage } from '@inrupt/solid-client-authn-node'

import { RegisterRoutes as RegisterAPIRoutes } from './api/routes'
import AppRouter from './app/routes'
import { sessionStorage } from './User/controller'

export const server = express()

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}

// Use body parser to read sent json payloads
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
server.use(cookieParser('super-secret-key-phrase'))
server.use(bodyParser.json())
server.use('/docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import('./api/swagger.json')))
})
server.use(async (req, res, next) => {
  const sessionId = req.signedCookies.session
  if (sessionId && !req.url.includes('redirect-from-solid-idp')) {
    const session = await getSessionFromStorage(
      sessionId,
      sessionStorage
    ).catch(() => {
      sessionStorage.delete(sessionId)
    })
    if (session?.info.isLoggedIn) {
      res.locals.session = session
    } else {
      sessionStorage.delete(sessionId)
    }
  }
  res.setHeader(
    'Access-Control-Allow-Origin',
    (req.headers.origin ??
      (req.headers.host && `http://${req.headers.host}`)) as string
  )
  res.setHeader('Vary', 'Origin')
  next()
})

server.use(AppRouter)
RegisterAPIRoutes(server)
