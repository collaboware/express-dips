import express from 'express'
import {
  Controller,
  Get,
  Route,
  SuccessResponse,
  Request,
  Security,
  Response,
} from 'tsoa'
import {
  getSessionFromStorage,
  IStorage,
  Session,
  //   getSessionIdFromStorageAll,
} from '@inrupt/solid-client-authn-node'
import { Repository } from 'typeorm'

import { cookieOptions } from '../server'
import { IPSDataSource } from '../datasource'
import { solidProfile, SolidProfileShape } from '../api/shex/generated'

import { User, UserSession } from './model'

const userRepo = IPSDataSource.getRepository<User>('User')
const sessionRepo = IPSDataSource.getRepository<UserSession>('UserSession')

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

@Route('user')
export class UserController extends Controller {
  @SuccessResponse('200')
  @Security('cookie')
  @Get('profile')
  public async profile(
    @Request() request: express.Request
  ): Promise<SolidProfileShape | { errors: string[] }> {
    const session = request.res?.locals.session
    solidProfile.fetcher._fetch = session.fetch
    const { data, errors } = await solidProfile.findOne({
      where: { id: session.info.webId },
      from: session.info.webId,
    })
    if (data && session.info.isLoggedIn) {
      const user = await userRepo.findOne({
        where: { webId: session.info.webId },
      })
      if (user && (!user?.name || user?.name !== data.name)) {
        user.name = data.name
        user.save()
      }
      return data
    } else {
      console.error(errors)
      request.res?.writeHead(404)
      return { errors } as { errors: string[] }
    }
  }

  @SuccessResponse('200', 'Logout successful') // Custom success response
  @Get('logout')
  public async logout(@Request() request: express.Request): Promise<boolean> {
    const session = await getSessionFromStorage(
      request.signedCookies.session,
      sessionStorage
    )
    session?.logout()

    const response = request.res as express.Response
    response.clearCookie('session')

    this.setStatus(200)
    if (session?.info.isLoggedIn) {
      return true
    }
    return false
  }

  @SuccessResponse('200', 'Login successful') // Custom success response
  @Get('login')
  public async login(@Request() request: express.Request): Promise<void> {
    const response = request.res as express.Response
    console.debug(response.locals.session)
    if (response.locals.session && response.locals.session.info.isLoggedIn) {
      response.redirect('/')
    }

    const session = new Session({
      storage: sessionStorage,
    })

    const redirectToSolidIdentityProvider = (url: string) => {
      const redirect = new URLSearchParams(
        new URL(`http://localhost:3000/${request.url}`).search
      ).get('redirect')
      if (redirect) {
        response.cookie('redirect', redirect, {
          ...cookieOptions,
        })
      } else {
        response.clearCookie('redirect')
      }
      response.cookie('session', session.info.sessionId, {
        ...cookieOptions,
        signed: true,
      })
      response.redirect(url)
    }

    await session.login({
      redirectUrl: `http://localhost:3000/api/user/redirect-from-solid-idp`,
      oidcIssuer: 'https://broker.pod.inrupt.com',
      clientName: 'Express IPS',
      handleRedirect: redirectToSolidIdentityProvider,
    })
  }

  @Response('500', 'Login was not successful.')
  @SuccessResponse('301', 'Successfully redirected from login') // Custom success response
  @Get('redirect-from-solid-idp')
  public async redirectFromSolidIdp(
    @Request() request: express.Request
  ): Promise<void> {
    const response = request.res as express.Response
    const redirect = request.cookies.redirect
    const sessionId = request.signedCookies.session
    const session = await getSessionFromStorage(
      sessionId,
      sessionStorage
    ).catch(console.error)
    await session
      ?.handleIncomingRedirect(`http://localhost:3000${request.url}`)
      .catch(console.error)

    if (session?.info.isLoggedIn) {
      let user = await userRepo.findOne({
        where: { webId: session.info.webId },
      })
      if (!user) {
        user = new User()
        user.webId = session.info.webId as string
        await user.save()
      }
      const userSession = await sessionRepo.findOne({
        where: {
          id: `solidClientAuthenticationUser:${session.info.sessionId}`,
        },
      })
      if (userSession) {
        sessionRepo.save({ ...userSession, user })
      }
      if (redirect) {
        response.clearCookie('redirect')
        response.redirect(301, `http://localhost:3000${redirect}`)
      } else {
        response.redirect(301, `http://localhost:3000/`)
      }
    } else {
      response.clearCookie('session')
      response.status(500).send('Login was not successful.')
    }
  }
}
