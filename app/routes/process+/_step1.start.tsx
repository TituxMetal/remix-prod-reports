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

import { STEP_ONE_INTENT, STEP_TWO_INTENT, WORKER_ROLE } from '~/constants'
import {
  authSessionStorage,
  getAuthSessionInfo,
  getSessionExpirationDate,
  isStaffUser,
  validateUserInSession
} from '~/utils'

const personalIdSchema = z.object({
  personalId: z
    .string({ required_error: 'Personal ID is required' })
    .min(8, { message: 'Personal Id must be exactly 8 characters long.' })
    .max(8, { message: 'Personal Id must be exactly 8 characters long.' })
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: personalIdSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const personalId = submission.value.personalId
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })

  if (!validPersonalId) {
    return submission.reply({ fieldErrors: { personalId: ['Invalid personalId.'] } })
  }

  authSession.set('intent', STEP_TWO_INTENT)
  authSession.set('personalId', validPersonalId.personalId)

  const commitSession = await authSessionStorage.commitSession(authSession, {
    expires: getSessionExpirationDate(true)
  })

  throw redirect(`/process/${personalId}`, {
    headers: { 'Set-Cookie': commitSession }
  })
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const { intent, personalId } = getAuthSessionInfo(authSession)
  const validSessionIntent = intent === STEP_ONE_INTENT
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })

  if (validPersonalId && validSessionIntent) {
    authSession.set('intent', STEP_TWO_INTENT)
    authSession.set('personalId', validPersonalId.personalId)

    const commitSession = await authSessionStorage.commitSession(authSession, {
      expires: getSessionExpirationDate(true)
    })

    throw redirect(`/process/${validPersonalId.personalId}`, {
      headers: { 'Set-Cookie': commitSession }
    })
  }

  const staffUser = await isStaffUser(authSession)

  if (staffUser) {
    throw redirect('/dashboard')
  }

  if (!validSessionIntent || (validPersonalId && !validSessionIntent)) {
    throw redirect('/', {
      headers: { 'Set-Cookie': await authSessionStorage.destroySession(authSession) }
    })
  }

  return {}
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Create New Report -> Step One -> Personal ID' }]
}

const ProcessStartRoute = () => {
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(personalIdSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithZod(formData, { schema: personalIdSchema })
  })

  return (
    <div className='m-auto flex min-h-full flex-col items-center justify-center gap-y-2 bg-gray-900'>
      <h1 className='px-4 text-center text-3xl font-bold leading-snug text-sky-600'>
        Create New Report
      </h1>
      <h2 className='px-4 text-center text-2xl font-bold leading-snug text-orange-600'>Step 1</h2>
      <Form method='post' {...getFormProps(form)} className='flex flex-col gap-4'>
        {form.errors && (
          <p className='text-xs text-red-300' id={form.errorId}>
            {form.errors}
          </p>
        )}
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.personalId.id}>Personal ID</label>
          <input
            className='rounded-md border-2 border-orange-400 bg-gray-800 text-gray-200 placeholder:text-gray-400 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.personalId, { type: 'text' })}
            placeholder='Personal ID'
          />
          {fields.personalId.errors && (
            <p className='text-xs text-red-300' id={fields.personalId.errorId}>
              {fields.personalId.errors}
            </p>
          )}
        </div>
        <div>
          <button
            type='submit'
            className='rounded-md bg-sky-700 px-4 py-2 text-lg font-semibold text-orange-300 ring-2 ring-orange-500 hover:bg-sky-800 focus:bg-sky-800 focus-visible:outline-none'
          >
            Next
          </button>
        </div>
      </Form>
    </div>
  )
}

export default ProcessStartRoute
