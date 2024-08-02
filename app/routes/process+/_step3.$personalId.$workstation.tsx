import { getFormProps, getInputProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { z } from 'zod'

import { STEP_FOUR_INTENT, STEP_THREE_INTENT, WORKER_ROLE } from '~/constants'
import { prisma } from '~/libs'
import {
  getAuthSessionInfo,
  getUserIdByPersonalId,
  isStaffUser,
  validateUserInSession
} from '~/utils/auth.server'
import { authSessionStorage, getSessionExpirationDate } from '~/utils/session.server'

const createReportSchema = z.object({
  dateOfDay: z.string({ required_error: 'Date of day is required' }),
  hourOfDay: z.string({ required_error: 'Hour of day is required' }),
  reasonForDowntime: z.string({ required_error: 'Reason for downtime is required' }),
  storageLocation: z.string().optional(),
  duration: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Duration must be a number'
    })
    .int()
    .positive({ message: 'Duration must be a positive number' }),
  details: z.string().optional(),
  workstationId: z.string({ required_error: 'Workstation is required' }),
  workerId: z.string({ required_error: 'Worker is required' })
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: createReportSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const personalId = (authSession.get('personalId') as string) ?? ''
  const {
    dateOfDay,
    hourOfDay,
    reasonForDowntime,
    storageLocation,
    duration,
    details,
    workstationId,
    workerId
  } = submission.value
  const validWorkstationId = await prisma.workstation.findUnique({
    select: { id: true },
    where: { id: workstationId }
  })
  const validWorkerId = await getUserIdByPersonalId(personalId)
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })

  if (!validPersonalId || !validWorkstationId || !validWorkerId) {
    return submission.reply({ formErrors: ['Invalid form fields.'] })
  }

  const startDate = new Date(`${dateOfDay} ${hourOfDay}`)
  const endDate = new Date(startDate.getTime() + duration * 60000)
  const newReport = await prisma.report.create({
    data: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reasonForDowntime,
      storageLocation,
      details,
      duration,
      workstationId,
      ownerId: workerId
    }
  })

  if (!newReport) {
    return submission.reply({ formErrors: ['There was an error creating the report'] })
  }

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const resumeReportParam = `${currentTimestamp}-${newReport.id}`
  const nextStepUrl = `/process/${validPersonalId.personalId}/${validWorkstationId.id}/${resumeReportParam}`

  authSession.set('intent', STEP_FOUR_INTENT)

  const commitSession = await authSessionStorage.commitSession(authSession, {
    expires: getSessionExpirationDate(true)
  })

  return redirect(nextStepUrl, {
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
  const validSessionIntent = intent === STEP_THREE_INTENT
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })
  const validPersonalIdParam = validPersonalId?.personalId === (params.personalId as string) ?? ''
  const workstationId = (params.workstation as string) ?? ''
  const validWorkstationId = await prisma.workstation.findUnique({
    select: { id: true },
    where: { id: workstationId }
  })

  const workerId = await getUserIdByPersonalId(validPersonalId?.personalId ?? '')
  const validSessionData = validPersonalId && validSessionIntent
  const validParams = validPersonalIdParam && validWorkstationId

  if (!validSessionData || !workerId || !validParams) {
    throw redirect('/', {
      headers: { 'Set-Cookie': await authSessionStorage.destroySession(authSession) }
    })
  }

  return { workerId, workstationId: validWorkstationId.id }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Create New Report -> Step Three -> Report Details' }]
}

const ProcessReportDetailsFormRoute = () => {
  const lastResult = useActionData<typeof action>()
  const { workerId, workstationId } = useLoaderData<typeof loader>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createReportSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      dateOfDay: format(new Date(), 'yyyy-MM-dd', { locale: fr }),
      hourOfDay: format(new Date(), 'HH:mm'),
      duration: 3,
      workerId,
      workstationId
    },
    onValidate: ({ formData }) => parseWithZod(formData, { schema: createReportSchema })
  })

  return (
    <div className='m-auto flex min-h-full flex-col items-center justify-center gap-y-2 bg-gray-900'>
      <h1 className='px-4 text-center text-3xl font-bold leading-snug text-sky-600'>
        Create New Report
      </h1>
      <h2 className='px-4 text-center text-2xl font-bold leading-snug text-orange-600'>
        Step 3 - Report Details
      </h2>
      <Form method='post' {...getFormProps(form)} className='flex flex-col gap-4'>
        {form.errors && (
          <p className='text-xs text-red-300' id={form.errorId}>
            {form.errors}
          </p>
        )}
        <input {...getInputProps(fields.workerId, { type: 'hidden' })} />
        <input {...getInputProps(fields.workstationId, { type: 'hidden' })} />
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.dateOfDay.id}>Date of Day</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.dateOfDay, { type: 'date' })}
            placeholder='Date of Day'
          />
          {fields.dateOfDay.errors && (
            <p className='text-xs text-red-300' id={fields.dateOfDay.errorId}>
              {fields.dateOfDay.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.hourOfDay.id}>Hour of Day</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.hourOfDay, { type: 'time' })}
            placeholder='Hour of Day'
          />
          {fields.hourOfDay.errors && (
            <p className='text-xs text-red-300' id={fields.hourOfDay.errorId}>
              {fields.hourOfDay.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.reasonForDowntime.id}>Reason For Downtime</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.reasonForDowntime, { type: 'text' })}
            placeholder='Reason For Downtime'
          />
          {fields.reasonForDowntime.errors && (
            <p className='text-xs text-red-300' id={fields.reasonForDowntime.errorId}>
              {fields.reasonForDowntime.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.storageLocation.id}>Storage Location</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.storageLocation, { type: 'text' })}
            placeholder='Storage Location'
          />
          {fields.storageLocation.errors && (
            <p className='text-xs text-red-300' id={fields.storageLocation.errorId}>
              {fields.storageLocation.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.duration.id}>Duration</label>
          <input
            className='form-input rounded-md border border-orange-300 bg-gray-700 text-gray-200 [appearance:textfield] placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.duration, { type: 'number' })}
            placeholder='Duration'
          />
          {fields.duration.errors && (
            <p className='text-xs text-red-300' id={fields.duration.errorId}>
              {fields.duration.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.details.id}>Details</label>
          <textarea
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-offset-gray-900'
            {...getTextareaProps(fields.details)}
            placeholder='Details'
          />
          {fields.details.errors && (
            <p className='text-xs text-red-300' id={fields.details.errorId}>
              {fields.details.errors}
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

export default ProcessReportDetailsFormRoute
