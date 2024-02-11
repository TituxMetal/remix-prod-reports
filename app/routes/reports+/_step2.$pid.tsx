import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

import { PageLayout } from '~/components/common'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const personalId = params.pid
  const formData = await request.formData()
  const workstationId = formData.get('workstationId')

  if (workstationId === null) {
    return new Response('Bad Request', { status: 400 })
  }

  return redirect(`/reports/${personalId}/${workstationId}/new`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const personalId = params.pid

  return json({ personalId })
}

const Step2PidNewReportRoute = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <PageLayout>
      <h1>Step 2/4</h1>
      <p>Hello {data.personalId}, what's your job today?</p>
      <Form method='post' className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='workstationId-field'>Workstation</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='workstationId'
            id='workstationId-field'
            placeholder='Workstation'
          />
        </div>
        <div>
          <button
            type='submit'
            className='rounded-md border border-orange-300 bg-transparent px-2 py-3 text-orange-300 hover:bg-orange-400 hover:text-gray-900'
          >
            Next 3/4
          </button>
        </div>
      </Form>
    </PageLayout>
  )
}

export default Step2PidNewReportRoute
