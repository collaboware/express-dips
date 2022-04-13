import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import { IPSOpenApi, SolidProfileShape } from '../generated/openapi'

export interface InitialAppState {
  webId: string
}

export const api = new IPSOpenApi({ WITH_CREDENTIALS: true }).default
export const App: React.FC<InitialAppState> = ({ webId }) => {
  useEffect(() => {
    if (!webId) {
      window.location.replace('/api/user/login?redirect=/')
    }
  }, [webId])
  useEffect(() => {
    api.profile().then((data) => {
      if ((data as { errors: string[] }).errors) {
        console.error(data)
      } else {
        console.debug((data as SolidProfileShape).name)
      }
    })
  }, [])
  return (
    <Routes>
      <Route path="/" element={<main>Hello {webId}</main>}></Route>
      <Route path="*" element={<main>Not found</main>}></Route>
    </Routes>
  )
}
