import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { endOfDay, formatISO, startOfDay } from 'date-fns'

import { prisma } from '~/libs'

export const loader = async () => {
  const todayDate = new Date()
  const gte = formatISO(startOfDay(todayDate))
  const lt = formatISO(endOfDay(todayDate))
  const workstations = await prisma.workstation.findMany({
    select: {
      id: true,
      displayName: true,
      name: true,
      _count: { select: { reports: { where: { startDate: { gte, lt } } } } }
    }
  })

  return json({ workstations })
}

const DashboardWorkstationsListRoute = () => {
  const { workstations } = useLoaderData<typeof loader>()

  return (
    <div className='mt-8 px-4'>
      <h1 className='mb-2 text-center text-2xl font-bold text-orange-300'>Workstations</h1>
      <p className='text-sky-300'>Click on a Workstation to view reports.</p>
      <ul className='my-8 grid grid-cols-2 gap-8 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
        {workstations.length > 0 &&
          workstations.map(workstation => (
            <li
              key={workstation.id}
              className='col-span-1 rounded-lg bg-orange-800 hover:bg-orange-900'
            >
              <Link to={workstation.id}>
                <div className='flex flex-1 flex-col p-4'>
                  <dl className='mx-auto mt-4 flex flex-grow flex-col justify-between gap-2 text-center'>
                    <dt className='sr-only'>Name</dt>
                    <dd className='text-gray-200'>{workstation.name}</dd>
                    <dt className='sr-only'>Display Name</dt>
                    <dd className='text-gray-200'>{workstation.displayName}</dd>
                    <dt className='sr-only'>Reports Count</dt>
                    <dd className='text-orange-200'>
                      There is {workstation._count.reports} Report
                      {workstation._count.reports < 2 ? '' : 's'}
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

export default DashboardWorkstationsListRoute
