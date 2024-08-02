import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { STEP_THREE_INTENT, STEP_TWO_INTENT, WORKER_ROLE } from '~/constants'
import { prisma } from '~/libs'
import { getAuthSessionInfo, isStaffUser, validateUserInSession } from '~/utils/auth.server'
import { authSessionStorage, getSessionExpirationDate } from '~/utils/session.server'

const workstationIdSchema = z.object({
  workstationId: z.string({ required_error: 'Workstation Id is required' })
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: workstationIdSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const workstationId = submission.value.workstationId
  const validWorkstationId = await prisma.workstation.findUnique({
    select: { id: true },
    where: { id: workstationId }
  })

  if (!validWorkstationId) {
    return submission.reply({ fieldErrors: { workstationId: ['Invalid workstation Id.'] } })
  }

  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const personalId = (authSession.get('personalId') as string) ?? ''
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })

  if (!validPersonalId) {
    return submission.reply({ formErrors: ['Invalid personalId.'] })
  }

  authSession.set('intent', STEP_THREE_INTENT)
  authSession.set('personalId', validPersonalId.personalId)

  const commitSession = await authSessionStorage.commitSession(authSession, {
    expires: getSessionExpirationDate(true)
  })

  throw redirect(`/process/${personalId}/${workstationId}`, {
    headers: { 'Set-Cookie': commitSession }
  })
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const staffUser = await isStaffUser(authSession)

  if (staffUser) {
    throw redirect('/dashboard')
  }

  const { intent, personalId } = getAuthSessionInfo(authSession)
  const validSessionIntent = intent === STEP_TWO_INTENT
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })
  const validPersonalIdParam = validPersonalId?.personalId === (params.personalId as string) ?? ''

  if (!validSessionIntent || !validPersonalIdParam || (validPersonalId && !validSessionIntent)) {
    throw redirect('/', {
      headers: { 'Set-Cookie': await authSessionStorage.destroySession(authSession) }
    })
  }

  const workstationsList = await prisma.workstation.findMany({
    select: { id: true, displayName: true },
    orderBy: { displayName: 'asc' }
  })

  return { workstationsList }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Create New Report -> Step Two -> Workstation' }]
}

const ProcessSelectWorkstationRoute = () => {
  const lastResult = useActionData<typeof action>()
  const { workstationsList } = useLoaderData<typeof loader>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(workstationIdSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithZod(formData, { schema: workstationIdSchema })
  })

  return (
    <div className='m-auto flex min-h-full flex-col items-center justify-center gap-y-2 bg-gray-900'>
      <h1 className='px-4 text-center text-3xl font-bold leading-snug text-sky-600'>
        Create New Report
      </h1>
      <h2 className='px-4 text-center text-2xl font-bold leading-snug text-orange-600'>Step 2</h2>
      <Form method='post' {...getFormProps(form)} className='flex flex-col gap-4'>
        {form.errors && (
          <p className='text-xs text-red-300' id={form.errorId}>
            {form.errors}
          </p>
        )}
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.workstationId.id}>Workstation</label>
          <select
            name={fields.workstationId.name}
            id={fields.workstationId.id}
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          >
            {workstationsList.map(({ id, displayName }, index) => (
              <option key={index} value={id}>
                {displayName}
              </option>
            ))}
          </select>
          {fields.workstationId.errors && (
            <p className='text-xs text-red-300' id={fields.workstationId.errorId}>
              {fields.workstationId.errors}
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

export default ProcessSelectWorkstationRoute
