import { getFormProps, getInputProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { addMinutes, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'

import { prisma } from '~/libs'

const editReportSchema = z.object({
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
  workerId: z.string({ required_error: 'Worker is required' }),
  workstationId: z.string({ required_error: 'Workstation is required' })
})

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('_referer')
  const reportId = params.reportId ?? ''
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: editReportSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const {
    dateOfDay,
    hourOfDay,
    reasonForDowntime,
    storageLocation,
    duration,
    details
    // workstationId,
    // workerId
  } = submission.value

  console.log('submission value:', submission.value)

  const startDate = new Date(`${dateOfDay} ${hourOfDay}`).toISOString()
  const startDatePlusDuration = addMinutes(startDate, duration)
  const endDate = new Date(startDatePlusDuration).toISOString()

  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      startDate,
      endDate,
      reasonForDowntime,
      storageLocation,
      details,
      duration
    }
  })

  if (!updatedReport) {
    return submission.reply({ formErrors: ['There was an error updating the report'] })
  }

  console.log('redirectTo in action:', redirectTo)
  // console.log('updatedReport:', updatedReport)

  // TODO: add the url that the user is comming from to redirect him back to the same page

  return redirect(safeRedirect(redirectTo, '/dashboard'))
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const reportId = params.reportId ?? ''
  const report = await prisma.report.findUnique({
    select: {
      id: true,
      startDate: true,
      endDate: true,
      reasonForDowntime: true,
      storageLocation: true,
      details: true,
      duration: true,
      owner: { select: { id: true, firstName: true, lastName: true } },
      workstation: { select: { id: true, displayName: true } },
      statusName: true
    },
    where: { id: reportId }
  })

  if (!report) {
    throw new Response('Report Not Found', { status: 404, statusText: 'Not Found' })
  }

  return json({ report })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `LogiProdReport | Dashboard -> Reports -> Edit ${data?.report.owner.firstName} ${data?.report.owner.lastName}'s Report`
    }
  ]
}

const EditReportDetailsRoute = () => {
  const { report } = useLoaderData<typeof loader>()
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(editReportSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      dateOfDay: format(report.startDate, 'yyyy-MM-dd', { locale: fr }),
      hourOfDay: format(report.startDate, 'HH:mm'),
      duration: report.duration,
      reasonForDowntime: report.reasonForDowntime,
      storageLocation: report.storageLocation,
      details: report.details,
      workerId: report.owner.id,
      workstationId: report.workstation.id
    },
    onValidate: ({ formData }) => parseWithZod(formData, { schema: editReportSchema })
  })

  return (
    <div className='mt-6 px-12'>
      <h1 className='mb-6 text-center text-2xl font-bold text-orange-300'>Edit Report Details</h1>
      <p className='mb-6 text-center text-lg text-sky-300'>
        Edit Report details from {report.owner.firstName} {report.owner.lastName} in{' '}
        {report.workstation.displayName}
      </p>
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
        <input {...getInputProps(fields.workerId, { type: 'hidden' })} />
        <input {...getInputProps(fields.workstationId, { type: 'hidden' })} />
        {/* TODO: add the possibility to change the workerId/workstationId based on the role/permission of the user that is editing the report */}
        <div className='flex gap-x-4'>
          <button
            type='submit'
            className='rounded-md border border-orange-600 bg-transparent px-6 py-4 font-bold text-gray-100 hover:border-orange-700 hover:bg-orange-700 hover:text-gray-100'
          >
            Edit
          </button>
          <button
            type='reset'
            className='rounded-md border border-rose-700 bg-rose-600 bg-transparent px-6 py-4 font-bold text-gray-50 hover:border-rose-800 hover:bg-rose-700 hover:text-gray-50'
          >
            Reset
          </button>
        </div>
      </Form>
    </div>
  )
}

export default EditReportDetailsRoute
