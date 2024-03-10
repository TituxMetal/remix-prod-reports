import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Link } from '@remix-run/react'

import { STEP_ONE_INTENT } from '~/constants'
import { authSessionStorage, getSessionExpirationDate, isStaffUser } from '~/utils'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const staffUser = await isStaffUser(authSession)

  if (staffUser) {
    throw redirect('/dashboard')
  }

  authSession.set('intent', STEP_ONE_INTENT)

  const commitSession = await authSessionStorage.commitSession(authSession, {
    expires: getSessionExpirationDate(true)
  })

  return json({}, { headers: { 'Set-Cookie': commitSession } })
}

const HomeRoute = () => {
  return (
    <div className='m-auto flex min-h-full flex-col items-center justify-center gap-y-2 bg-gray-900'>
      <h1 className='px-4 text-center text-4xl font-bold leading-snug text-sky-600'>
        Create New Reports
      </h1>
      <h2 className='px-4 text-center text-3xl font-bold leading-snug text-orange-600'>
        In Only 4 Steps
      </h2>
      <Link
        to='process/start'
        className='mt-8 flex max-w-60 rounded-xl bg-sky-700 px-6 py-8 text-center text-3xl font-semibold uppercase text-orange-300 ring-4 ring-orange-600 hover:bg-sky-800 focus:bg-sky-800 focus-visible:outline-none'
      >
        Start Now
      </Link>
    </div>
  )
}

export default HomeRoute
