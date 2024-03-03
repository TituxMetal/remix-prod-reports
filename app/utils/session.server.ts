import { createCookieSessionStorage } from '@remix-run/node'

const AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || ''

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'lpr_auth_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: AUTH_SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production'
  }
})
