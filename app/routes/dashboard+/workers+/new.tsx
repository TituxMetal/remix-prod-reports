import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'

import { PageLayout } from '~/components/common'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const { firstName, lastName, personalId, displayName, role } = Object.fromEntries(formData)

  // TODO: Check permission

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof personalId !== 'string' ||
    typeof displayName !== 'string' ||
    typeof role !== 'string'
  ) {
    return new Response('Bad Request', { status: 400 })
  }

  // TODO: Validate the form data properly

  console.log('formData', { firstName, lastName, personalId, displayName, role })

  // TODO: Create a new worker in the database

  return redirect(`/dashboard/workers`)
}

const NewWorkerRoute = () => {
  return (
    <PageLayout>
      <h1 className='text-center text-2xl font-bold text-orange-300'>Create New Worker</h1>
      <Form method='post' className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='firstname-field'>First Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='firstName'
            id='firstname-field'
            placeholder='First Name'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='lastname-field'>Last Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='lastName'
            id='lastname-field'
            placeholder='Last Name'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='personalId-field'>Personal ID</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='personalId'
            id='personalId-field'
            placeholder='Personal ID (I140C06E)'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='displayName-field'>Display Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='displayName'
            id='displayName-field'
            placeholder='Display Name'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='role-field'>Role</label>
          <select
            defaultValue='worker'
            name='role'
            id='role-field'
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          >
            <option value='admin'>Admin</option>
            <option value='worker'>Worker</option>
            <option value='team-leader'>Team Leader</option>
            <option value='depot-manager'>Depot Manager</option>
          </select>
        </div>
        <div>
          <button
            type='submit'
            className='rounded-md border border-orange-300 bg-transparent px-2 py-3 text-orange-300 hover:bg-orange-400 hover:text-gray-900'
          >
            Create
          </button>
        </div>
      </Form>
    </PageLayout>
  )
}

export default NewWorkerRoute
