import { getFormProps, getInputProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { redirect, type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { z } from 'zod'

import { prisma } from '~/libs'

const createReportStatus = z.object({
  name: z.string({ required_error: 'Name is required' }),
  displayName: z.string({ required_error: 'Display name is required' }),
  description: z.string().min(3).max(200).optional()
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: createReportStatus })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { name, displayName, description } = submission.value
  const existingStatus = await prisma.reportStatus.findFirst({
    where: { OR: [{ name }, { displayName }] }
  })

  if (existingStatus) {
    return submission.reply({
      formErrors: ['A status with that name or display name already exists']
    })
  }

  const newRole = await prisma.reportStatus.create({
    data: { name, displayName, description }
  })

  if (!newRole) {
    return submission.reply({ formErrors: ['There was an error creating the status'] })
  }

  return redirect(`/dashboard`)
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Dashboard -> Admin -> Report Status -> Create Report Status' }]
}

const NewReportStatusRoute = () => {
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createReportStatus),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithZod(formData, { schema: createReportStatus })
  })

  return (
    <div className='mt-6 px-12'>
      <h1 className='mb-6 text-center text-2xl font-bold text-orange-300'>Create Report Status</h1>
      <Form
        method='post'
        {...getFormProps(form)}
        className='flex flex-col gap-4 rounded-md bg-gray-700 px-6 py-6'
      >
        {form.errors && <p id={form.errorId}>{form.errors}</p>}
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.name.id}>Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            placeholder='Name'
            {...getInputProps(fields.name, { type: 'text' })}
          />
          {fields.name.errors && (
            <p className='text-xs text-red-300' id={fields.name.errorId}>
              {fields.name.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.displayName.id}>Display Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            placeholder='Display Name'
            {...getInputProps(fields.displayName, { type: 'text' })}
          />
          {fields.displayName.errors && (
            <p className='text-xs text-red-300' id={fields.displayName.errorId}>
              {fields.displayName.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.description.id}>Description</label>
          <textarea
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-offset-gray-900'
            {...getTextareaProps(fields.description)}
            placeholder='Description'
          />
          {fields.description.errors && (
            <p className='text-xs text-red-300' id={fields.description.errorId}>
              {fields.description.errors}
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

export default NewReportStatusRoute
