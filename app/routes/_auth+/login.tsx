import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { z } from 'zod'

import { WORKER_ROLE } from '~/constants'
import {
  authSessionStorage,
  getAuthSessionInfo,
  getSessionExpirationDate,
  isStaffUser,
  login,
  validateUserInSession
} from '~/utils'

const loginSchema = z.object({
  identifier: z
    .string({ required_error: 'Personal ID or Username is required' })
    .min(5, { message: 'Identifier must be at least 5 characters long' })
    .max(8, { message: 'Identifier must be at most 8 characters long' }),
  password: z.string({ required_error: 'Password is required' })
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: loginSchema })

  if (submission.status !== 'success') {
    return submission.reply({ hideFields: ['password'] })
  }

  const { identifier, password } = submission.value
  const user = await login(identifier, password)

  if (!user) {
    return submission.reply({ hideFields: ['password'], formErrors: ['Invalid credentials'] })
  }

  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const { id, personalId, role } = user

  authSession.set('userId', id)
  authSession.set('personalId', personalId)
  authSession.set('role', role.name)

  const commitSession = await authSessionStorage.commitSession(authSession, {
    expires: getSessionExpirationDate()
  })

  if (role.name === WORKER_ROLE) {
    throw redirect('/profile', { headers: { 'Set-Cookie': commitSession } })
  }

  throw redirect('/dashboard', { headers: { 'Set-Cookie': commitSession } })
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const { sessionRole, sessionUserId } = getAuthSessionInfo(authSession)
  const authenticatedUser = await validateUserInSession({
    key: 'id',
    sessionValue: sessionUserId,
    role: sessionRole
  })
  const staffUser = await isStaffUser(authSession)

  if (authenticatedUser && staffUser) {
    return redirect('/dashboard')
  }

  if (authenticatedUser && sessionRole === WORKER_ROLE) {
    return redirect('/profile')
  }

  return {}
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Log In' }]
}

const LoginRoute = () => {
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(loginSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithZod(formData, { schema: loginSchema })
  })

  return (
    <div className='m-auto flex min-h-full flex-col items-center gap-y-2 bg-gray-900 sm:justify-center'>
      <h1 className='px-4 text-center text-4xl font-bold leading-snug text-sky-600'>Log In to</h1>
      <h2 className='px-4 text-center text-2xl font-semibold leading-snug text-orange-600'>
        Logi Prod Report
      </h2>
      <Form method='post' {...getFormProps(form)} className='flex flex-col gap-4'>
        {form.errors && (
          <p className='text-xs text-red-300' id={form.errorId}>
            {form.errors}
          </p>
        )}
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.identifier.id}>Identifier</label>
          <input
            className='rounded-md border-2 border-orange-400 bg-gray-800 text-gray-200 placeholder:text-gray-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.identifier, { type: 'text' })}
            placeholder='Personal ID or Username'
          />
          {fields.identifier.errors && (
            <p className='text-xs text-red-300' id={fields.identifier.errorId}>
              {fields.identifier.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.password.id}>Password</label>
          <input
            className='rounded-md border-2 border-orange-400 bg-gray-800 text-gray-200 placeholder:text-gray-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.password, { type: 'password' })}
            placeholder='Password'
          />
          {fields.password.errors && (
            <p className='text-xs text-red-300' id={fields.password.errorId}>
              {fields.password.errors}
            </p>
          )}
        </div>
        <div>
          <button
            type='submit'
            className='rounded-md bg-sky-700 px-4 py-2 text-lg font-semibold text-orange-300 ring-2 ring-orange-500 hover:bg-sky-800 focus:bg-sky-800 focus-visible:outline-none'
          >
            Log In
          </button>
        </div>
      </Form>
    </div>
  )
}

export default LoginRoute
