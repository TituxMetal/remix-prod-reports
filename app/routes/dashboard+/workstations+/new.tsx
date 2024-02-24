import { getFormProps, getInputProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { redirect, type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { z } from 'zod'

import { prisma } from '~/libs'

const workstationTypes = ['Mobile', 'Fixed'] as const
const WorkstationTypeEnum = z.enum(workstationTypes)

const createWorkstationSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  displayName: z.string({ required_error: 'Display name is required' }),
  type: WorkstationTypeEnum,
  description: z.string().min(3).max(100).optional()
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: createWorkstationSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { name, displayName, type, description } = submission.value
  const existingWorkstation = await prisma.workstation.findFirst({
    where: { OR: [{ name }, { displayName }] }
  })

  if (existingWorkstation) {
    return submission.reply({
      formErrors: ['A workstation with that name or display name already exists']
    })
  }

  const newWorkstation = await prisma.workstation.create({
    data: { name, displayName, type, description }
  })

  if (!newWorkstation) {
    return submission.reply({ formErrors: ['There was an error creating the workstation'] })
  }

  return redirect(`/dashboard`)
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Dashboard -> Admin -> Workstations -> Create Workstation' }]
}

const NewWorkstationRoute = () => {
  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(createWorkstationSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: { type: workstationTypes[0] },
    onValidate: ({ formData }) => parseWithZod(formData, { schema: createWorkstationSchema })
  })

  return (
    <div className='mt-6 px-12'>
      <h1 className='mb-6 text-center text-2xl font-bold text-orange-300'>Create Workstation</h1>
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
          <label htmlFor={fields.name.id}>Name</label>
          <input
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            {...getInputProps(fields.name, { type: 'text' })}
            placeholder='Name'
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
            {...getInputProps(fields.displayName, { type: 'text' })}
            placeholder='Display Name'
          />
          {fields.displayName.errors && (
            <p className='text-xs text-red-300' id={fields.displayName.errorId}>
              {fields.displayName.errors}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor={fields.type.id}>Type</label>
          <select
            defaultValue={fields.type.initialValue}
            name='type'
            id={fields.type.id}
            className='rounded-md border border-orange-300 bg-gray-700 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
          >
            {workstationTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
          {fields.type.errors && (
            <p className='text-xs text-red-300' id={fields.type.errorId}>
              {fields.type.errors}
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

export default NewWorkstationRoute
