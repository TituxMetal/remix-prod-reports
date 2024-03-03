import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { format } from 'date-fns'
import { useEffect } from 'react'

import { STEP_FOUR_INTENT, WORKER_ROLE } from '~/constants'
import { prisma } from '~/libs'
import { authSessionStorage, getAuthSessionInfo, isStaffUser, validateUserInSession } from '~/utils'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const staffUser = await isStaffUser(authSession)

  if (staffUser) {
    throw redirect('/dashboard')
  }

  const { intent, personalId } = getAuthSessionInfo(authSession)
  const validSessionIntent = intent === STEP_FOUR_INTENT
  const validPersonalId = await validateUserInSession({
    key: 'personalId',
    sessionValue: personalId,
    role: WORKER_ROLE
  })
  const validPersonalIdParam = validPersonalId?.personalId === (params.personalId as string) ?? ''
  const workstationId = (params.workstation as string) ?? ''
  const [timestampParam, reportIdParam] = (params.summary as string).split('-')
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const timestampDiff = currentTimestamp - parseInt(timestampParam, 10)
  const isTimestampValid = timestampDiff < 30 // 30 seconds
  const report = await prisma.report.findUnique({
    select: {
      id: true,
      startDate: true,
      endDate: true,
      storageLocation: true,
      reasonForDowntime: true,
      duration: true,
      details: true,
      workstation: { select: { displayName: true, name: true } },
      owner: { select: { firstName: true, lastName: true } }
    },
    where: { id: reportIdParam, workstationId }
  })

  const validSessionData = validPersonalId && validSessionIntent
  const validParams = validPersonalIdParam && isTimestampValid

  if (!validSessionData || !validParams || !report) {
    throw redirect('/', {
      headers: { 'Set-Cookie': await authSessionStorage.destroySession(authSession) }
    })
  }

  return { report }
}

export const meta: MetaFunction = () => {
  return [{ title: 'LogiProdReport | Create New Report -> Step Four -> Report Summary' }]
}

const ProcessReportSummaryRoute = () => {
  const { report } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  useEffect(() => {
    const id = setTimeout(() => {
      navigate('/')
    }, 30000)

    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div className='m-auto flex min-h-full flex-col items-center justify-stretch gap-y-2 bg-gray-900 sm:justify-center'>
      <h1 className='px-4 text-center text-3xl font-bold leading-snug text-orange-600'>
        Report Summary
      </h1>
      <section className='mx-auto flex flex-col gap-y-2'>
        <div className='flex flex-col justify-between p-2'>
          <p className='py-1 font-bold'>
            {format(report.startDate, 'MMM dd yyyy')}
            {' at '}
            <time dateTime={report.startDate}>{format(report.startDate, 'HH:mm')}</time>
            {' to '}
            <time dateTime={report.endDate}>{format(report.endDate, 'HH:mm')}</time>
          </p>
          <div className='flex justify-between py-1 text-lg'>
            <span className='font-semibold'>
              {report.owner.firstName} {report.owner.lastName}
            </span>
            <span>{report.workstation.displayName}</span>
          </div>
        </div>
        <div className='p-2'>
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
      </section>
    </div>
  )
}

export default ProcessReportSummaryRoute
