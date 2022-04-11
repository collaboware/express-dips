import express, { Router } from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import { App, InitialAppState } from './App'
import template from './AppTemplate'

export const AppRouter = Router()
AppRouter.use('/assets', express.static(__dirname))
AppRouter.get('/*', (req, res, next) => {
  if (
    !req.headers.accept?.includes('text/html') ||
    req.url.startsWith('/api')
  ) {
    next()
  } else {
    const initialState: InitialAppState = {
      webId: res.locals.session?.info.webId as string,
    }
    const appString = renderToString(
      <StaticRouter location={req.url}>
        <App {...initialState} />
      </StaticRouter>
    )
    res.send(
      template({
        body: `<!DOCTYPE html> ${appString}`,
        title: 'Express IPS',
        initialState: JSON.stringify(initialState),
      })
    )
  }
})

export default AppRouter
