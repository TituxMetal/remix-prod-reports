import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'

import { PageLayout } from '~/components/common'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const { name, type, description, displayName } = Object.fromEntries(formData)

  // TODO: Check permission

  if (
    typeof name !== 'string' ||
    typeof type !== 'string' ||
    typeof description !== 'string' ||
    typeof displayName !== 'string'
  ) {
    return new Response('Bad Request', { status: 400 })
  }

  // TODO: Validate the form data properly

  console.log('formData', { name, type, description, displayName })

  // TODO: Create a new workstation in the database

  return redirect(`/dashboard/workstations`)
}

const NewWorkstationRoute = () => {
  return (
    <PageLayout>
      <h1 className='text-center text-2xl font-bold text-orange-300'>Create New Workstation</h1>
      <Form method='post' className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='name-field'>Workstation Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='name'
            id='name-field'
            placeholder='Workstation Name'
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
          <label htmlFor='type-field'>Type</label>
          <select
            defaultValue='mobile'
            name='type'
            id='type-field'
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          >
            <option value='mobile'>Mobile</option>
            <option value='fixed'>Fixed</option>
          </select>
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
            Create
          </button>
        </div>
      </Form>
    </PageLayout>
  )
}

export default NewWorkstationRoute
