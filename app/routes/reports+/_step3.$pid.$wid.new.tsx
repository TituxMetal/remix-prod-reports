import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { format } from 'date-fns'

import { PageLayout } from '~/components/common'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const personalId = params.pid
  const workstationId = params.wid
  const formData = await request.formData()

  const {
    reportId,
    dateOfDay,
    hourOfDay,
    reasonForDowntime,
    storageLocation,
    duration,
    description
  } = Object.fromEntries(formData)

  if (personalId === null || workstationId === null) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (
    typeof dateOfDay !== 'string' ||
    typeof hourOfDay !== 'string' ||
    typeof reasonForDowntime !== 'string' ||
    typeof storageLocation !== 'string' ||
    typeof duration !== 'string' ||
    typeof description !== 'string'
  ) {
    return new Response('Bad Request', { status: 400 })
  }

  console.log('reportData', {
    reportId,
    dateOfDay,
    hourOfDay,
    reasonForDowntime,
    storageLocation,
    duration,
    description
  })

  return redirect(`/reports/${personalId}/${workstationId}/${reportId}`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const personalId = params.pid
  const workstationId = params.wid

  return json({ personalId, workstationId })
}

const Step3WidNewReportRoute = () => {
  return (
    <PageLayout>
      <h1>Step 3/4 - Create report</h1>
      <Form method='post' className='flex flex-col gap-4'>
        <input type='hidden' name='reportId' defaultValue={format(new Date(), 'yyyyMMddHHmmss')} />
        <div className='flex flex-col gap-2'>
          <label htmlFor='dateOfDay-field'>Date of Day</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='date'
            name='dateOfDay'
            id='dateOfDay-field'
            defaultValue={format(new Date(), 'yyyy-MM-dd')}
            placeholder='Date of Day'
          />
        </div>
        <label htmlFor='hourOfDay-field'>Hour of Day</label>
        <input
          className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          type='time'
          name='hourOfDay'
          id='hourOfDay-field'
          defaultValue={format(new Date(), 'HH:mm')}
          placeholder='Hour of Day'
        />
        <div className='flex flex-col gap-2'></div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='reasonForDowntime-field'>Reason For Downtime</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='reasonForDowntime'
            id='reasonForDowntime-field'
            placeholder='Reason'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='storageLocation-field'>Stock Location</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='storageLocation'
            id='storageLocation-field'
            placeholder='Stock Location'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='duration-field'>Duration (min)</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='number'
            name='duration'
            id='duration-field'
            defaultValue='3'
            placeholder='Duration in minutes'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='description-field'>Description</label>
          <textarea
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            name='description'
            id='description-field'
            placeholder='Description'
          />
        </div>
        <div>
          <button
            type='submit'
            className='rounded-md border border-orange-300 bg-transparent px-2 py-3 text-orange-300 hover:bg-orange-400 hover:text-gray-900'
          >
            Submit
          </button>
        </div>
      </Form>
    </PageLayout>
  )
}

export default Step3WidNewReportRoute
