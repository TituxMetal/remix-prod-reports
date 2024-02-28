import { getFormProps, getInputProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { redirect, type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { addMinutes, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { z } from 'zod'

import { prisma } from '~/libs'

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

  const startDate = new Date(`${dateOfDay} ${hourOfDay}`).toISOString()
  const startDatePlusDuration = addMinutes(startDate, duration)
  const endDate = new Date(startDatePlusDuration).toISOString()

  const newReport = await prisma.report.create({
    data: {
      startDate,
      endDate,
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

  return redirect(`/dashboard`)
}

export const loader = async () => {
  const workersList = await prisma.user.findMany({
    select: {
      id: true,
      personalId: true,
      username: true,
      role: { select: { name: true } }
    },
    where: { role: { name: 'Worker' } }
  })
  const workstationsList = await prisma.workstation.findMany({
    select: { id: true, displayName: true }
  })

  return { workersList, workstationsList }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Dashboard -> Admin -> Reports -> Create Report' }]
}

const NewReportPage = () => {
  const { workersList, workstationsList } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createReportSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      dateOfDay: format(new Date(), 'yyyy-MM-dd', { locale: fr }),
      hourOfDay: format(new Date(), 'HH:mm'),
      duration: 3
    },
    onValidate: ({ formData }) => parseWithZod(formData, { schema: createReportSchema })
  })

  return (
    <div className='mt-6 px-12'>
      <h1 className='mb-6 text-center text-2xl font-bold text-orange-300'>Create Report</h1>
      <Form
        method='post'
        {...getFormProps(form)}
        className='flex flex-col gap-4 rounded-md bg-gray-700 px-6 py-6'
      >
        {form.errors && (
          <p className='text-xs text-red-300' id={form.errorId}>
            {form.errors}
          </p>
        )}
        <div className='flex flex-col gap-2'>
          <label htmlFor='dateOfDay-field'>Date of Day</label>
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
          <label htmlFor='hourOfDay-field'>Hour of Day</label>
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
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.workerId.id}>Worker</label>
          <select
            name={fields.workerId.name}
            id={fields.workerId.id}
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          >
            {workersList.map(({ id, personalId, username }, index) => (
              <option key={index} value={id}>
                {username} - {personalId}
              </option>
            ))}
          </select>
          {fields.workerId.errors && (
            <p className='text-xs text-red-300' id={fields.workerId.errorId}>
              {fields.workerId.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.workstationId.id}>Worker</label>
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
            className='rounded-md border border-orange-600 bg-transparent px-6 py-4 font-bold text-gray-100 hover:border-orange-700 hover:bg-orange-700 hover:text-gray-100'
          >
            Create
          </button>
        </div>
      </Form>
    </div>
  )
}

export default NewReportPage
