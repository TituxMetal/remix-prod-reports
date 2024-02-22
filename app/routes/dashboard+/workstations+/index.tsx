import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { prisma } from '~/libs'

export const loader = async () => {
  const workstations = await prisma.workstation.findMany({
    select: { id: true, name: true, displayName: true, description: true, type: true }
  })

  return { workstations }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Admin -> Workstations' }]
}

const WorkstationsIndexRoute = () => {
  const { workstations } = useLoaderData<typeof loader>()

  return (
    <div className='mt-6 px-4'>
      <h2 className='mb-6 text-center text-2xl font-bold text-orange-300'>Workstations</h2>
      <ul className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        <li className='rounded-t-lg bg-orange-800 hover:bg-orange-900'>
          <Link to='new' className='flex flex-1 flex-col p-8 sm:p-2'>
            <div className='flex flex-1 flex-col p-6 lg:p-8'>
              <div className='mx-auto flex size-24 flex-shrink-0 flex-col items-center justify-center rounded-full bg-gray-900 p-8 md:size-32 lg:size-36 xl:size-40'>
                <PlusIcon className='m-auto text-orange-400' />
              </div>
              <p className='mx-auto mt-6 flex flex-grow flex-col justify-between text-lg font-bold text-gray-200'>
                Add New Workstation
              </p>
            </div>
          </Link>
        </li>
        {workstations.length > 0 &&
          workstations.map(workstation => (
            <li
              key={workstation.id}
              className='col-span-1 h-fit divide-y divide-gray-200 rounded-t-lg bg-orange-800'
            >
              <div className='flex flex-1 flex-col px-2 py-6'>
                <p className='m-auto text-xl font-bold text-orange-400'>
                  {workstation.displayName}
                </p>
                <dl className='mt-2 flex flex-grow flex-col justify-between gap-2'>
                  <dt className='font-semibold text-gray-100'>Name:</dt>
                  <dd className='ml-2 text-sm text-gray-300'>{workstation.name}</dd>
                  <dt className='font-semibold text-gray-100'>Description:</dt>
                  <dd className='ml-2 text-sm text-gray-300'>{workstation.description}</dd>
                  <dt className='font-semibold text-gray-100'>Type:</dt>
                  <dd className='ml-2 text-sm text-gray-300'>{workstation.type}</dd>
                </dl>
              </div>
              <div>
                <div className='flex divide-x divide-gray-200'>
                  <div className='flex w-0 flex-1 bg-orange-900 hover:bg-orange-800'>
                    <Link
                      to='#'
                      className='relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 border border-transparent py-4 text-base font-bold text-sky-300 xl:text-lg'
                    >
                      <PencilSquareIcon className='size-5 text-sky-300' aria-hidden='true' />
                      Edit
                    </Link>
                  </div>
                  <div className='-ml-px flex w-0 flex-1 bg-orange-900 hover:bg-orange-800'>
                    <Link
                      to='#'
                      className='relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 border border-transparent py-4 text-base font-bold text-red-300 xl:text-lg'
                    >
                      <TrashIcon className='size-5 text-red-300' aria-hidden='true' />
                      Delete
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default WorkstationsIndexRoute
