import { redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form } from '@remix-run/react'

import { PageLayout } from '~/components/common'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const { personalId, password } = Object.fromEntries(formData)

  if (String(personalId).trim() === '' || String(password).trim() === '') {
    return new Response('Bad Request', { status: 400 })
  }

  // TODO: Implement login logic

  return redirect('/dashboard')
}

const LoginRoute = () => {
  return (
    <PageLayout>
      <h1 className='text-center text-2xl font-bold text-orange-300'>Log In to dashboard</h1>
      <Form method='post' className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='personalId-field'>Personal ID</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='text'
            name='personalId'
            id='personalId-field'
            placeholder='Personal ID'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='password-field'>Password</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            type='password'
            name='password'
            id='password-field'
            placeholder='Password'
          />
        </div>
        <div>
          <button
            type='submit'
            className='rounded-md border border-orange-300 bg-transparent px-2 py-3 text-orange-300 hover:bg-orange-400 hover:text-gray-900'
          >
            Log In
          </button>
        </div>
      </Form>
    </PageLayout>
  )
}

export default LoginRoute
