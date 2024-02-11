import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

import { PageLayout } from '~/components/common'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const personalId = params.pid
  const workstationId = params.wid
  const reportId = params.reportId

  if (personalId === null || workstationId === null || reportId === null) {
    return new Response('Bad Request', { status: 400 })
  }

  const reportData = {
    dateOfDay: '2024-02-10',
    hourOfDay: '22:59',
    reasonForDowntime: 'Picking mal prélevé',
    storageLocation: '3-032-0059-00',
    duration: '6',
    description: `Remise en place de 4 colis + Nettoyage film qui traine + Pose de la palette`
  }

  return json({ personalId, workstationId, reportId, ...reportData })
}

const Step4EndNewReportRoute = () => {
  const data = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  useEffect(() => {
    const id = setTimeout(() => {
      navigate('/')
    }, 30000)

    return () => clearTimeout(id)
  }, [navigate])

  return (
    <PageLayout>
      <header className='mx-auto flex flex-col gap-y-2'>
        <h1 className='mb-4 text-center text-2xl text-orange-300'>Report Details</h1>
        <p>
          Report ID: <strong>{data.reportId}</strong>
        </p>
        <p>
          Worker: <strong>{data.personalId}</strong>
        </p>
      </header>
      <section className='mx-auto flex flex-col gap-y-2'>
        <h2 className='mb-2 text-center text-xl text-orange-300'>Summary</h2>
        <ul>
          <li>
            <strong>Date/Time of Downtime:</strong> {data.dateOfDay}, {data.hourOfDay}
          </li>
          <li>
            <strong>Workstation:</strong> {data.workstationId}
          </li>
          <li>
            <strong>Storage Location:</strong> {data.storageLocation}
          </li>
          <li>
            <strong>Reason for Downtime:</strong> {data.reasonForDowntime}
          </li>
          <li>
            <strong>Duration:</strong> {data.duration} minute{data.duration > 1 ? 's' : ''}
          </li>
        </ul>
      </section>
      <section className='mx-auto flex flex-col gap-y-2'>
        <h2 className='mb-2 text-center text-xl text-orange-300'>Detailed Description</h2>
        <p>{data.description}</p>
      </section>
    </PageLayout>
  )
}

export default Step4EndNewReportRoute
