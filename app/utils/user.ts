import { useRouteLoaderData } from '@remix-run/react'

import { type loader as rootLoader } from '~/root'

/**
 * Returns the optional user data from the route loader.
 * If the user data is not available, it returns null.
 * @returns The optional user data or null.
 */
export const useOptionalUser = () => {
  const data = useRouteLoaderData<typeof rootLoader>('root')

  return data?.user ?? null
}

/**
 * Custom hook that returns the user object.
 * Throws an error if no user is found in the root loader.
 * If the user is optional, use the `useOptionalUser` hook instead.
 *
 * @returns The user object.
 * @throws Error if no user is found in the root loader.
 */
export const useUser = () => {
  const mayBeUser = useOptionalUser()

  if (!mayBeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.'
    )
  }

  return mayBeUser
}
