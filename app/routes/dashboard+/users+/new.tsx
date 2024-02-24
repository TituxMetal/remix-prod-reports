import { getFormProps, getInputProps, getSelectProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { redirect, type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { hash, prisma } from '~/libs'

const createUserSchema = z.object({
  firstName: z.string({ required_error: 'First name is required' }),
  lastName: z.string({ required_error: 'Last name is required' }),
  personalId: z.string({ required_error: 'Personal ID is required' }),
  username: z.string({ required_error: 'Username is required' }),
  password: z.string({ required_error: 'Password is required' }),
  role: z.string({ required_error: 'Role is required' })
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: createUserSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { firstName, lastName, personalId, username, password, role } = submission.value
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { personalId }] }
  })
  const hashedPassword = await hash(password)

  if (existingUser) {
    return submission.reply({
      formErrors: ['A user with that username or personal ID already exists']
    })
  }

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      personalId,
      username,
      password: { create: { hash: hashedPassword } },
      role: { connect: { id: role } }
    }
  })

  if (!newUser) {
    return submission.reply({ formErrors: ['There was an error creating the user'] })
  }

  return redirect('/dashboard')
}

export const loader = async () => {
  const roles = await prisma.role.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, displayName: true }
  })

  return { roles }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Dashboard -> Admin -> Users -> Create User' }]
}

const NewUserRoute = () => {
  const lastResult = useActionData<typeof action>()
  const { roles } = useLoaderData<typeof loader>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createUserSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithZod(formData, { schema: createUserSchema })
  })

  return (
    <div className='mt-6 px-12'>
      <h1 className='mb-6 text-center text-2xl font-bold text-orange-300'>Create User</h1>
      <Form
        method='post'
        {...getFormProps(form)}
        className='flex flex-col gap-4 rounded-md bg-gray-700 px-6 py-6'
      >
        {form.errors && <p id={form.errorId}>{form.errors}</p>}
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.firstName.id}>First Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.firstName, { type: 'text' })}
            placeholder='First Name'
          />
          {fields.firstName.errors && (
            <p className='text-xs text-red-300' id={fields.firstName.errorId}>
              {fields.firstName.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.lastName.id}>Last Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.lastName, { type: 'text' })}
            placeholder='Last Name'
          />
          {fields.lastName.errors && (
            <p className='text-xs text-red-300' id={fields.lastName.errorId}>
              {fields.lastName.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.personalId.id}>Personal ID</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.personalId, { type: 'text' })}
            placeholder='Personal ID (I140C06E)'
          />
          {fields.personalId.errors && (
            <p className='text-xs text-red-300' id={fields.personalId.errorId}>
              {fields.personalId.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.username.id}>Username</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.username, { type: 'text' })}
            placeholder='Username'
          />
          {fields.username.errors && (
            <p className='text-xs text-red-300' id={fields.username.errorId}>
              {fields.username.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.password.id}>Password</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.password, { type: 'password' })}
            placeholder='Password'
          />
          {fields.password.errors && (
            <p className='text-xs text-red-300' id={fields.password.errorId}>
              {fields.password.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.role.id}>Role</label>
          <select
            // defaultValue='worker'
            {...getSelectProps(fields.role)}
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          >
            <option value=''>Select a role</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.displayName})
              </option>
            ))}
          </select>
          {fields.role.errors && (
            <p className='text-xs text-red-300' id={fields.role.errorId}>
              {fields.role.errors}
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

export default NewUserRoute
