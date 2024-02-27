import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'

import { prisma } from '~/libs'

export const loader = async () => {
  // const todayDate = new Date()
  // const gte = formatISO(startOfDay(todayDate))
  // const lt = formatISO(endOfDay(todayDate))

  const reports = await prisma.report.findMany({
    select: {
      id: true,
      startDate: true,
      endDate: true,
      reasonForDowntime: true,
      storageLocation: true,
      details: true,
      duration: true,
      workstation: { select: { name: true, displayName: true } },
      owner: { select: { firstName: true, lastName: true, personalId: true } }
    },
    take: 50
  })

  return { reports }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Dashboard -> Admin -> Reports -> Latest Reports' }]
}

const ReportsIndexRoute = () => {
  const { reports } = useLoaderData<typeof loader>()

  return (
    <div className='relative mt-6 px-4'>
      <h2 className='-mb-8 py-6 text-center text-2xl font-bold text-orange-300'>Last 50 Reports</h2>
      <div className='relative -top-10 flex justify-end'>
        <Link
          to='new'
          className='flex items-center justify-center rounded-md bg-orange-500 p-2 hover:bg-orange-600 '
        >
          <div className='flex items-center justify-center rounded-full bg-gray-700 p-1 text-orange-300 hover:bg-gray-800 hover:text-orange-400'>
            <PlusIcon className='size-10 ' />
          </div>
        </Link>
      </div>
      <ul className='-mb-12 w-full'>
        {reports.map((report, index) => (
          <li key={report.id} className='relative flex w-full gap-x-4'>
            <div className='relative w-full pb-12'>
              {index !== reports.length - 1 ? (
                <span
                  className='absolute left-3 top-5 -ml-px h-full w-0.5 bg-orange-600/50'
                  aria-hidden='true'
                />
              ) : null}
              <div className='relative flex items-start space-x-3'>
                <div className='relative px-1'>
                  <div className='flex size-4 items-center justify-center rounded-full bg-orange-400 ring-8 ring-gray-800'>
                    <div className='size-3 rounded-full bg-gray-800' aria-hidden='true' />
                  </div>
                </div>
                <div className='flex-auto divide-y divide-sky-400 rounded-md bg-orange-800 text-gray-300 ring-1 ring-inset ring-sky-500 hover:text-gray-100'>
                  <div className='flex justify-between gap-x-4 p-3 pb-2'>
                    <p className='py-0.5 text-xs leading-5'>
                      {format(report.startDate, 'MMM dd yyyy')}
                      {' at '}
                      <time dateTime={report.startDate}>{format(report.startDate, 'HH:mm')}</time>
                      {' to '}
                      <time dateTime={report.endDate}>{format(report.endDate, 'HH:mm')}</time>
                    </p>
                    <div className='py-0.5 text-xs leading-5'>
                      <span className='font-medium'>
                        {report.owner.firstName} {report.owner.lastName}
                      </span>{' '}
                      {report.owner.personalId}
                    </div>
                    <div className='py-0.5 text-xs leading-5'>{report.workstation.displayName}</div>
                  </div>
                  <div className='p-3 pb-2'>
                    <p className='text-lg font-bold leading-8'>
                      {report.reasonForDowntime} ({report.duration} min
                      {report.duration > 1 && 's'})
                    </p>
                    {report.storageLocation && (
                      <p className='text-sm leading-6'>
                        <span className='font-semibold'>Emp:</span> {report.storageLocation}
                      </p>
                    )}
                    {report.details && (
                      <p className='py-1 text-sm leading-6'>
                        <span className='font-semibold'>Details:</span> {report.details}
                      </p>
                    )}
                  </div>
                  <div className='flex justify-around p-2'>
                    <Link
                      to='#'
                      className='flex items-center p-2 text-base font-bold text-sky-300 hover:text-sky-400 xl:text-lg'
                    >
                      <PencilSquareIcon className='mr-2 size-5' aria-hidden='true' />
                      Edit
                    </Link>
                    <Link
                      to='#'
                      className='flex items-center p-2 text-base font-bold text-red-300 hover:text-red-400 xl:text-lg'
                    >
                      <TrashIcon className='mr-2 size-5' aria-hidden='true' />
                      Delete
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ReportsIndexRoute
