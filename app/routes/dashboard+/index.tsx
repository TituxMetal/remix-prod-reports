import { Link } from '@remix-run/react'

import { PageLayout } from '~/components/common'

const DashboardIndexRoute = () => {
  return (
    <PageLayout>
      <h1 className='text-center text-2xl font-bold text-orange-300'>Dashboard</h1>
      <p>Welcome to the dashboard.</p>
      <div>
        <ul className='flex gap-4 *:text-orange-300'>
          <li>
            <Link to='workers'>Show Workers</Link>
          </li>
          <li>
            <Link to='reports'>Show Reports</Link>
          </li>
          <li>
            <Link to='workstations'>Show Workstations</Link>
          </li>
        </ul>
      </div>
    </PageLayout>
  )
}

export default DashboardIndexRoute
