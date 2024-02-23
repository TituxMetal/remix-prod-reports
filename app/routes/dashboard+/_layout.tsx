import { Link, Outlet } from '@remix-run/react'

const DashboardLayout = () => {
  return (
    <>
      <div className='bg-sky-900'>
        <div className='mx-auto max-w-screen-2xl pb-16 sm:px-6 lg:px-8'>
          <header className='py-10'>
            <div className='mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8'>
              <h1 className='text-3xl font-bold tracking-tight text-orange-100'>Dashboard</h1>
            </div>
          </header>
        </div>
      </div>
      <main className='-mt-16'>
        <div className='mx-auto max-w-screen-2xl px-4 pb-12 sm:px-6 lg:px-8'>
          <div className='rounded-lg bg-gray-800 px-5 py-6 sm:px-6'>
            <ul className='flex w-full gap-x-12 *:text-orange-200'>
              <li>
                <Link to='workers'>Workers</Link>
              </li>
              <li>
                <Link to='reports'>Reports</Link>
              </li>
              <li>
                <Link to='workstations'>Workstations</Link>
              </li>
              <li>
                <Link to='users'>Users</Link>
              </li>
              <li>
                <Link to='roles'>Roles</Link>
              </li>
            </ul>
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}

export default DashboardLayout
