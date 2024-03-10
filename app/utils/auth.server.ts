import { type User } from '@prisma/client'
import { redirect, type Session, type SessionData } from '@remix-run/node'

import { StaffRoles } from '~/constants'
import { prisma, verify } from '~/libs'

import { authSessionStorage, getCookieSession } from './session.server'

interface ValidateUserArgs {
  key: keyof User
  sessionValue: string
  role: string
}

/**
 * Retrieves a user based on the provided key, session value, and role.
 * @param {ValidateUserArgs} args - The arguments for validating the user.
 * @returns - A promise that resolves to the user if found, otherwise null.
 */
export const validateUserInSession = async ({ key, sessionValue, role }: ValidateUserArgs) => {
  const user = (await prisma.user.findFirst({
    select: { [key]: true },
    where: { AND: [{ [key]: sessionValue }, { role: { name: role } }] }
  })) as User | null

  return user
}

/**
 * Retrieves the user ID based on the personal ID.
 * @param personalId - The personal ID of the user.
 * @returns The user ID if found, otherwise null.
 */
export const getUserIdByPersonalId = async (personalId: string) => {
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { personalId }
  })

  return user?.id ?? null
}

/**
 * Retrieves the authentication session information.
 * @param authSession - The authentication session object.
 * @returns An object containing the session information.
 */
export const getAuthSessionInfo = (authSession: Session<SessionData, SessionData>) => {
  const intent = (authSession.get('intent') as string) ?? ''
  const personalId = (authSession.get('personalId') as string) ?? ''
  const sessionRole = (authSession.get('role') as string) ?? ''
  const sessionUserId = (authSession.get('userId') as string) ?? ''

  return { intent, personalId, sessionRole, sessionUserId }
}

/**
 * Checks if the authenticated user is a staff user.
 *
 * @param authSession - The authentication session object.
 * @returns A boolean indicating whether the user is a staff user or not.
 */
export const isStaffUser = async (authSession: Session<SessionData, SessionData>) => {
  const { sessionUserId: sessionValue, sessionRole: role } = getAuthSessionInfo(authSession)
  const validUser = await validateUserInSession({ key: 'id', sessionValue, role })

  return !!validUser && (Object.values(StaffRoles) as string[]).includes(role)
}

/**
 * Requires the user to be a staff user.
 * If the user is not a staff user, it throws a redirect to the login page.
 * @param request - The request object.
 * @throws {Redirect} - If the user is not a staff user, it throws a redirect to the login page.
 */
export const requireStaffUser = async (request: Request) => {
  const cookieSession = await getCookieSession(request)
  const staffUser = await isStaffUser(cookieSession)

  if (!staffUser) {
    throw redirect('/login')
  }
}

/**
 * Requires the user to be an admin.
 *
 * @param request - The request object.
 * @returns A Promise that resolves to the valid user if the user is an admin.
 * @throws {Redirect} If the user is not a valid admin, it throws a redirect to the login page.
 */
export const requireAdminUser = async (request: Request) => {
  const authSession = await getCookieSession(request)
  const { sessionUserId: sessionValue, sessionRole: role } = getAuthSessionInfo(authSession)
  const validUser = await validateUserInSession({ key: 'id', sessionValue, role })

  if (!validUser || role !== 'Admin') {
    throw redirect('/login')
  }

  return validUser
}

/**
 * Retrieves the user's information based on the identifier.
 * @param identifier - The user's identifier (e.g., username or personalId).
 * @returns The user object with the password hash if found, otherwise null.
 */
export const getUserByIdentifier = async (identifier: string) => {
  const userWithPassword = await prisma.user.findFirst({
    select: {
      id: true,
      username: true,
      personalId: true,
      password: { select: { hash: true } },
      role: { select: { name: true } }
    },
    where: { OR: [{ username: identifier }, { personalId: identifier }] }
  })

  return userWithPassword
}

/**
 * Verifies the user's password.
 * @param hash - The password hash.
 * @param password - The user's password.
 * @returns A promise that resolves to a boolean indicating whether the password is valid or not.
 */
const verifyPassword = async (hash: string, password: string) => {
  const validPassword = await verify(hash, password)

  return validPassword
}

/**
 * Authenticates a user by their identifier and password.
 * @param identifier - The user's identifier (e.g., username or personalId).
 * @param password - The user's password.
 * @returns The user object without the password if authentication is successful, otherwise null.
 */
export const login = async (identifier: string, password: string) => {
  const userWithPassword = await getUserByIdentifier(identifier)

  if (!userWithPassword?.password) {
    return null
  }

  const { hash } = userWithPassword.password

  const isValidUser = await verifyPassword(hash, password)

  if (!isValidUser) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}

/**
 * Logs out the user by destroying the session and redirecting to the login page.
 * @param request - The request object.
 * @returns A redirect response to the login page.
 */
export const logout = async (request: Request) => {
  const authSession = await getCookieSession(request)
  const destroySession = await authSessionStorage.destroySession(authSession)

  return redirect('/login', {
    headers: { 'Set-Cookie': destroySession }
  })
}
