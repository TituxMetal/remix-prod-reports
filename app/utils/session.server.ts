import { createCookieSessionStorage } from '@remix-run/node'

import { SESSION_EXPIRATION_TIME, SHORT_SESSION_EXPIRATION_TIME } from '~/constants'

const AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || ''

/**
 * Creates a cookie session storage for authentication.
 * @returns The created cookie session storage.
 */
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

/**
 * Retrieves the authentication session from the provided request's cookie.
 * @param request - The request object containing the headers.
 * @returns A promise that resolves to the authentication session.
 */
export const getCookieSession = async (request: Request) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))

  return authSession
}

/**
 * Returns the expiration date of the session.
 * @param short - Optional parameter to specify whether to use the short session expiration time.
 * @returns The expiration date of the session.
 */
export const getSessionExpirationDate = (short?: boolean) => {
  const expirationTime = short ? SHORT_SESSION_EXPIRATION_TIME : SESSION_EXPIRATION_TIME

  return new Date(Date.now() + expirationTime)
}
