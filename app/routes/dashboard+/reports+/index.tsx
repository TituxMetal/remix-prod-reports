import { getFormProps, getInputProps, getSelectProps, useForm } from '@conform-to/react'
import { getZodConstraint } from '@conform-to/zod'
import {
  ExclamationTriangleIcon,
  HandThumbUpIcon,
  PencilSquareIcon,
  PlusIcon
} from '@heroicons/react/20/solid'
import { redirectDocument, type LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  useSubmit
} from '@remix-run/react'
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays
} from 'date-fns'
import { z } from 'zod'

import { WORKER_ROLE } from '~/constants'
import { prisma } from '~/libs'
import { groupReportsByDay, sortReportsByDay } from '~/utils'

const filterReportsSchema = z.object({
  countFilter: z.string(),
  statusFilter: z.string(),
  workstationsFilter: z.string(),
  workersFilter: z.string(),
  dateRangesFilter: z.string(),
  page: z.string()
})

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const todayDate = new Date()
  const dateRangesFilter = [
    { name: 'today', displayName: 'Today', from: startOfDay(todayDate), to: endOfDay(todayDate) },
    {
      name: 'yesterday',
      displayName: 'Yesterday',
      from: startOfDay(subDays(todayDate, 1)),
      to: endOfDay(subDays(todayDate, 1))
    },
    { name: 'week', displayName: 'Week', from: startOfWeek(todayDate), to: endOfWeek(todayDate) },
    {
      name: 'last-week',
      displayName: 'Last Week',
      from: startOfWeek(subDays(todayDate, 7)),
      to: endOfWeek(subDays(todayDate, 7))
    },
    {
      name: 'month',
      displayName: 'Month',
      from: startOfMonth(todayDate),
      to: endOfMonth(todayDate)
    },
    {
      name: 'last-month',
      displayName: 'Last Month',
      from: startOfMonth(subDays(todayDate, todayDate.getDate())),
      to: endOfMonth(subDays(todayDate, todayDate.getDate()))
    },
    { name: 'year', displayName: 'Year', from: startOfYear(todayDate), to: endOfYear(todayDate) },
    {
      name: 'last-year',
      displayName: 'Last Year',
      from: startOfYear(subDays(todayDate, 365)),
      to: endOfYear(subDays(todayDate, 365))
    }
  ]
  const countFilter = ['5', '10', '25']

  const { searchParams } = new URL(request.url)

  // Extract filter values from the request parameters
  const statusParams = searchParams.get('statusFilter') ?? undefined
  const workstationsParams = searchParams.get('workstationsFilter') ?? undefined
  const workersParams = searchParams.get('workersFilter') ?? undefined
  const dateRangesParams = searchParams.get('dateRangesFilter') ?? undefined
  const countParams = searchParams.get('countFilter') ?? undefined
  const pageParams = searchParams.get('page') ?? '1' // Default to page 1 if not provided

  if (
    workersParams === '' &&
    workstationsParams === '' &&
    statusParams === '' &&
    dateRangesParams === '' &&
    countParams === '' &&
    pageParams === ''
  ) {
    return redirectDocument(`/dashboard/reports`)
  }
  console.log('searchParams:', searchParams)

  const where = {
    statusName: { contains: statusParams }, // Filter by status
    workstation: { name: { contains: workstationsParams } }, // Filter by workstation
    // Assuming workers contain unique identifiers like usernames
    owner: { username: { contains: workersParams } } // Filter by worker
  }

  const selectedDateRange = dateRangesFilter.find(range => range.name === dateRangesParams)

  if (selectedDateRange) {
    Object.assign(where, { startDate: { gte: selectedDateRange.from, lt: selectedDateRange.to } })
  }

  const defaultPerPage = 10
  const totalReports = await prisma.report.count({ where })
  const perPage = countParams ? parseInt(countParams) : defaultPerPage
  const totalPages = Math.ceil(totalReports / perPage)
  const currentPage = parseInt(pageParams)
  const nextPage = currentPage + 1
  const prevPage = currentPage - 1

  const skip = (currentPage - 1) * perPage
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
      owner: { select: { id: true, firstName: true, lastName: true, personalId: true } },
      statusName: true
    },
    where,
    take: perPage,
    skip,
    orderBy: { startDate: 'asc' }
  })

  if (!reports) {
    throw new Response('Reports Not Found', { status: 404, statusText: 'Not Found' })
  }

  const statusFilter = await prisma.reportStatus.findMany({
    select: { name: true, displayName: true }
  })

  if (!statusFilter) {
    throw new Response('Report Status Not Found', { status: 404, statusText: 'Not Found' })
  }

  const workstationsFilter = await prisma.workstation.findMany({
    select: { name: true, displayName: true }
  })

  if (!workstationsFilter) {
    throw new Response('Workstations Not Found', { status: 404, statusText: 'Not Found' })
  }

  const workersFilter = await prisma.user.findMany({
    select: { username: true, firstName: true, lastName: true },
    where: { role: { name: WORKER_ROLE } }
  })

  if (!workersFilter) {
    throw new Response('Workers Not Found', { status: 404, statusText: 'Not Found' })
  }

  const reportsByDay = groupReportsByDay(reports)
  const sortedReportsByDay = sortReportsByDay(reportsByDay)

  return {
    sortedReportsByDay,
    paginator: { currentPage, nextPage, prevPage, totalPages, totalReports },
    countFilter,
    dateRangesFilter,
    statusFilter,
    workstationsFilter,
    workersFilter
  }
}

const ReportsListRoute = () => {
  const {
    sortedReportsByDay,
    paginator,
    countFilter,
    dateRangesFilter,
    statusFilter,
    workstationsFilter,
    workersFilter
  } = useLoaderData<typeof loader>()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const countFilterParams = Number(searchParams.get('countFilter'))
  const referer = encodeURIComponent(location.pathname)
  const statusFetcher = useFetcher()
  const defaultValue = {
    statusFilter: searchParams.get('statusFilter') ?? null,
    workstationsFilter: searchParams.get('workstationsFilter') ?? null,
    workersFilter: searchParams.get('workersFilter') ?? null,
    dateRangesFilter: searchParams.get('dateRangesFilter') ?? null,
    countFilter: countFilterParams || null,
    page: searchParams.get('page') ?? '1'
  }
  const navigate = useNavigate()
  const submit = useSubmit()

  const [form, fields] = useForm({
    constraint: getZodConstraint(filterReportsSchema),
    shouldRevalidate: 'onBlur',
    defaultValue
  })

  const existingParams = Object.fromEntries(searchParams.entries())

  const resetHandler = () => {
    console.log('RESET')
    navigate(
      location.pathname +
        '?page=&statusFilter=&workstationsFilter=&workersFilter=&dateRangesFilter=&countFilter='
    )
  }

  return (
    <div className='relative mt-6 px-4'>
      <h1 className='-mb-8 py-6 text-center text-2xl font-bold text-orange-300'>
        Latest {paginator.totalReports} Report{paginator.totalReports > 1 ? 's' : ''}
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
      <div className='w-full rounded-md bg-sky-800 px-4 py-6'>
        <Form
          className='flex flex-col gap-4'
          {...getFormProps(form)}
          method='get'
          action='/dashboard/reports'
          onChange={e => submit(e.currentTarget)}
          onReset={() => resetHandler()}
        >
          <input {...getInputProps(fields.page, { type: 'hidden' })} />
          <div className='flex flex-wrap justify-center gap-4'>
          <div>
            <label htmlFor={fields.statusFilter.id}>Status: </label>
            <select
              {...getSelectProps(fields.statusFilter)}
                className='rounded-md border border-orange-300 bg-sky-900 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            >
              <option value=''>All</option>
              {statusFilter.map(({ name, displayName }) => (
                <option key={name} value={name}>
                  {displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={fields.workstationsFilter.id}>Workstations: </label>
            <select
              {...getSelectProps(fields.workstationsFilter)}
                className='rounded-md border border-orange-300 bg-sky-900 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            >
              <option value=''>All</option>
              {workstationsFilter.map(({ name, displayName }) => (
                <option key={name} value={name}>
                  {displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={fields.workersFilter.id}>Workers: </label>
            <select
              {...getSelectProps(fields.workersFilter)}
                className='rounded-md border border-orange-300 bg-sky-900 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            >
              <option value=''>All</option>
              {workersFilter.map(({ username, firstName, lastName }) => (
                <option key={username} value={username}>
                  {firstName} {lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={fields.dateRangesFilter.id}>Date Ranges: </label>
            <select
              {...getSelectProps(fields.dateRangesFilter)}
                className='rounded-md border border-orange-300 bg-sky-900 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            >
              <option value=''>All Time</option>
              {dateRangesFilter.map(({ name, displayName }) => (
                <option key={name} value={name}>
                  {displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={fields.countFilter.id}>Count: </label>
            <select
              {...getSelectProps(fields.countFilter)}
                className='rounded-md border border-orange-300 bg-sky-900 text-gray-200 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:ring-offset-gray-900'
            >
              <option value=''>All</option>
              {countFilter.map(count => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            </div>
          </div>
          <button
            type='reset'
            className='m-auto justify-center rounded-md bg-gray-800 px-6 py-2 font-bold text-gray-100 hover:bg-gray-900 hover:text-gray-100'
          >
            Reset
          </button>
        </Form>
      </div>
      <div className='mt-6 flex py-2'>
        {paginator.currentPage > 1 && (
          <Link
            to={{
              pathname: '/dashboard/reports',
              search: `?${new URLSearchParams({
                ...existingParams,
                page: paginator.prevPage.toString()
              }).toString()}`
            }}
            className='justify-start rounded-md bg-orange-900 px-4 py-2 text-lg text-orange-200 hover:text-orange-300'
          >
            Previous
          </Link>
        )}
        {paginator.nextPage <= paginator.totalPages && (
          <Link
            to={{
              pathname: '/dashboard/reports',
              search: `?${new URLSearchParams({
                ...existingParams,
                page: paginator.nextPage.toString()
              }).toString()}`
            }}
            className='ml-auto justify-end rounded-md bg-orange-900 px-4 py-2 text-lg text-orange-200 hover:text-orange-300'
          >
            Next
          </Link>
        )}
      </div>
      {sortedReportsByDay.map((item, index) => (
        <div className='-mt-2 mb-8' key={index}>
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
                            to={`/dashboard/workers/${report.owner?.id}`}
                            className='font-semibold text-indigo-200 hover:text-indigo-300'
                          >
                            {report.owner?.personalId}
                          </Link>
                        </div>
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
                      <statusFetcher.Form method='post'>
                        <div className='flex justify-around p-2'>
                          <Link
                            to={`/dashboard/reports/${report.id}?_referer=${referer}`}
                            className='flex items-center rounded-lg bg-orange-900 px-4 py-2 text-base font-bold text-sky-300 hover:bg-orange-950/40 hover:text-sky-400 xl:text-lg'
                          >
                            <PencilSquareIcon className='mr-2 size-5' aria-hidden='true' />
                            Edit
                          </Link>
                          <input type='hidden' name='reportId' value={report.id} />
                          <button
                            type='submit'
                            name='intent'
                            value='reviewed'
                            className='flex items-center rounded-lg bg-orange-900 px-4 py-2 text-base font-bold text-emerald-300 hover:bg-orange-950/40 hover:text-emerald-400 xl:text-lg'
                          >
                            <HandThumbUpIcon className='mr-2 size-5' aria-hidden='true' />
                            Review Report
                          </button>
                          <button
                            type='submit'
                            name='intent'
                            value='cancelled'
                            className='flex items-center rounded-lg bg-orange-900 px-4 py-2 text-base font-bold text-yellow-300 hover:bg-orange-950/40 hover:text-yellow-400 xl:text-lg'
                          >
                            <ExclamationTriangleIcon className='mr-2 size-5' aria-hidden='true' />
                            Cancel Report
                          </button>
                        </div>
                      </statusFetcher.Form>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className='mb-4 mt-14 flex py-2'>
        {paginator.currentPage > 1 && (
          <Link
            to={{
              pathname: '/dashboard/reports',
              search: `?${new URLSearchParams({
                ...existingParams,
                page: paginator.prevPage.toString()
              }).toString()}`
            }}
            className='justify-start rounded-md bg-orange-900 px-4 py-2 text-lg text-orange-200 hover:text-orange-300'
          >
            Previous
          </Link>
        )}
        {paginator.nextPage <= paginator.totalPages && (
          <Link
            to={{
              pathname: '/dashboard/reports',
              search: `?${new URLSearchParams({
                ...existingParams,
                page: paginator.nextPage.toString()
              }).toString()}`
            }}
            className='ml-auto justify-end rounded-md bg-orange-900 px-4 py-2 text-lg text-orange-200 hover:text-orange-300'
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}

export default ReportsListRoute
