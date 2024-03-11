import { PlusIcon } from '@heroicons/react/20/solid'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { WORKER_ROLE } from '~/constants'
import { prisma } from '~/libs'

export const loader = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      personalId: true,
      username: true,
      role: { select: { name: true } },
      _count: { select: { reports: true } }
    },
    where: { role: { name: WORKER_ROLE } }
  })

  return json({ users })
}

const DashboardWorkersListRoute = () => {
  const { users } = useLoaderData<typeof loader>()

  return (
    <div className='mt-8 px-4'>
      <h1 className='mb-2 text-center text-2xl font-bold text-orange-300'>Workers</h1>
      <p className='text-sky-300'>
        Click on a Worker to view their reports, or create a new Worker.
      </p>
      <ul className='my-8 grid grid-cols-2 gap-8 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
        <li className='rounded-lg bg-orange-800 hover:bg-orange-900'>
          <Link to='new' className='flex flex-col p-4'>
            <div className='m-auto size-16 rounded-full bg-gray-900 p-2'>
              <PlusIcon className='m-auto text-orange-400' />
            </div>
            <p className='m-auto mt-4 text-base font-bold text-gray-200'>New Worker</p>
          </Link>
        </li>
        {users.length > 0 &&
          users.map(user => (
            <li key={user.id} className='col-span-1 rounded-lg bg-orange-800 hover:bg-orange-900'>
              <Link to={user.id}>
                <div className='flex flex-1 flex-col p-4'>
                  <div className='mx-auto flex size-16 flex-shrink-0 flex-col items-center justify-center rounded-full bg-gray-900 p-4'>
                    <p className='m-auto font-medium text-orange-400'>
                      {user.firstName.charAt(0).toUpperCase()}{' '}
                      {user.lastName.charAt(0).toUpperCase()}
                    </p>
                  </div>
                  <dl className='mx-auto mt-4 flex flex-grow flex-col justify-between gap-2 text-center'>
                    <dt className='sr-only'>Personal ID (Username)</dt>
                    <dd className='text-gray-200'>
                      {user.personalId} ({user.username})
                    </dd>
                    <dt className='sr-only'>Full Name</dt>
                    <dd className='text-gray-200'>
                      {user.firstName} {user.lastName}
                    </dd>
                    <dt className='sr-only'>Reports</dt>
                    <dd className='text-orange-200'>
                      {user._count.reports} Report{user._count.reports < 2 ? '' : 's'}
                    </dd>
                  </dl>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default DashboardWorkersListRoute
