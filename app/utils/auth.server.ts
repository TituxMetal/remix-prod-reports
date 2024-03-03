import { type User } from '@prisma/client'
import { type Session, type SessionData } from '@remix-run/node'

import { WORKER_ROLE } from '~/constants'
import { prisma } from '~/libs'

interface ValidateUserArgs {
  key: keyof User
  sessionValue: string
  role: string
}

/**
 * Retrieves a user based on the provided key, session value, and role.
 * @param {ValidateUserArgs} args - The arguments for validating the user.
 * @returns {Promise<User | null>} - A promise that resolves to the user if found, otherwise null.
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

  return !!validUser && role !== WORKER_ROLE
}