import {
  ExclamationTriangleIcon,
  HandThumbUpIcon,
  PencilSquareIcon,
  PlusIcon
} from '@heroicons/react/20/solid'
import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData, useLocation } from '@remix-run/react'
import { endOfDay, format, formatISO, startOfDay } from 'date-fns'

import { prisma } from '~/libs'
import { groupReportsByDay, sortReportsByDay } from '~/utils'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const workerId = params.workerId ?? ''
  const owner = await prisma.user.findUnique({
    where: { id: workerId },
    select: { id: true, firstName: true, lastName: true, personalId: true }
  })

  if (!owner) {
    throw new Response('Owner Not Found', { status: 404, statusText: 'Not Found' })
  }

  const todayDate = new Date()
  const gte = formatISO(startOfDay(todayDate))
  const lt = formatISO(endOfDay(todayDate))

  const reports = await prisma.report.findMany({
    select: {
      id: true,
      startDate: true,
      endDate: true,
      reasonForDowntime: true,
      storageLocation: true,
      details: true,
      duration: true,
      workstation: { select: { id: true, name: true, displayName: true } },
      statusName: true
    },
    where: { ownerId: owner.id, startDate: { gte, lt } },
    orderBy: { startDate: 'desc' }
  })

  if (!reports) {
    throw new Response('Reports Not Found', { status: 404, statusText: 'Not Found' })
  }

  const reportsByDay = groupReportsByDay(reports)
  const sortedReportsByDay = sortReportsByDay(reportsByDay)

  return { sortedReportsByDay, owner }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `LogiProdReport | Dashboard -> Reports -> ${data?.owner.firstName} ${data?.owner.lastName}'s Latest Reports`
    }
  ]
}

const DashboardReportListByWorkerRoute = () => {
  const { sortedReportsByDay, owner } = useLoaderData<typeof loader>()
  const location = useLocation()
  const referer = encodeURIComponent(location.pathname)

  return (
    <div className='relative mt-6 px-4'>
      <h1 className='-mb-8 py-6 text-center text-2xl font-bold text-orange-300'>
        {owner.firstName} {owner.lastName} ({owner.personalId}) Reports
      </h1>
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
      {sortedReportsByDay.map((item, index) => (
        <div className='-mt-12 mb-8' key={index}>
          <p className='my-8 text-3xl font-semibold text-sky-400'>
            {format(item.dateOfDay, 'eeee, MMMM do yyyy')}
          </p>
          <ul className='-mb-8 w-full'>
            {item.reports.map(report => (
              <li key={report.id} className='relative flex w-full gap-x-4'>
                <div className='relative w-full pb-12'>
                  {index !== item.reports.length - 1 ? (
                    <span
                      className='absolute left-3 top-5 -ml-px h-5/6 w-0.5 bg-orange-600/50'
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
                      <div className='flex items-center justify-between gap-x-4 p-3 pb-2'>
                        <p className='py-0.5 text-xs leading-5'>
                          {'From '}
                          <time dateTime={report.startTime}>{report.startTime}</time>
                          {' to '}
                          <time dateTime={report.endTime}>{report.endTime}</time>
                        </p>
                        <p className='rounded-lg border border-yellow-300/60 bg-yellow-900 px-2 py-1 text-xs leading-5 text-yellow-200 '>
                          {report.statusName}
                        </p>
                        <div className='py-0.5 text-sm leading-5'>
                          <Link
                            to={`/dashboard/workstations/${report.workstation?.id}`}
                            className='font-semibold text-pink-200 hover:text-pink-300'
                          >
                            {report.workstation?.displayName}
                          </Link>
                        </div>
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
                          to={`/dashboard/reports/${report.id}?_referer=${referer}`}
                          className='flex items-center rounded-lg bg-orange-900 px-4 py-2 text-base font-bold text-sky-300 hover:bg-orange-950/40 hover:text-sky-400 xl:text-lg'
                        >
                          <PencilSquareIcon className='mr-2 size-5' aria-hidden='true' />
                          Edit
                        </Link>
                        <Link
                          to='#'
                          className='flex items-center rounded-lg bg-orange-900 px-4 py-2 text-base font-bold text-emerald-300 hover:bg-orange-950/40 hover:text-emerald-400 xl:text-lg'
                        >
                          <HandThumbUpIcon className='mr-2 size-5' aria-hidden='true' />
                          Review Report
                        </Link>
                        <Link
                          to='#'
                          className='flex items-center rounded-lg bg-orange-900 px-4 py-2 text-base font-bold text-yellow-300 hover:bg-orange-950/40 hover:text-yellow-400 xl:text-lg'
                        >
                          <ExclamationTriangleIcon className='mr-2 size-5' aria-hidden='true' />
                          Cancel Report
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DashboardReportListByWorkerRoute
