import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLocation } from '@remix-run/react'

import { requireStaffUser, useUser } from '~/utils'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireStaffUser(request)

  return json({})
}

const DashboardLayout = () => {
  const { role } = useUser()
  const isAdminUser = role.name === 'Admin'
  const location = useLocation()
  const isAdminPage = location.pathname.includes('admin')

  return (
    <>
      <div className='bg-sky-900'>
        <div className='mx-auto max-w-screen-2xl pb-16 sm:px-6 lg:px-8'>
          <header className='py-10'>
            <div className='mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8'>
              <h1 className='text-3xl font-bold tracking-tight text-orange-100'>
                {isAdminPage && ' Admin '}Dashboard
              </h1>
            </div>
          </header>
        </div>
      </div>
      <main className='-mt-16'>
        <div className='mx-auto max-w-screen-2xl px-4 pb-12 sm:px-6 lg:px-8'>
          <div className='rounded-lg bg-gray-800 px-5 pb-6 sm:px-6'>
            <ul className='flex justify-center gap-2'>
              <li className='mx-1'>
                <Link
                  className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                  to='/dashboard'
                >
                  Home
                </Link>
              </li>
              <li className='mx-1'>
                <Link
                  className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                  to='workers'
                >
                  Workers
                </Link>
              </li>
              {isAdminUser && (
                <>
                  <li className='mx-1'>
                    <Link
                      className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                      to='admin/roles'
                    >
                      Roles
                    </Link>
                  </li>
                  <li className='mx-1'>
                    <Link
                      className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                      to='admin/users'
                    >
                      Users
                    </Link>
                  </li>
                  <li className='mx-1'>
                    <Link
                      className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                      to='admin/workstations'
                    >
                      Workstations
                    </Link>
                  </li>
                  <li className='mx-1'>
                    <Link
                      className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                      to='admin/status'
                    >
                      Report Status
                    </Link>
                  </li>
                  <li className='mx-1'>
                    <Link
                      className='inline-block rounded-b-md border-x-2 border-b-2 border-sky-700 bg-orange-800 px-3 py-1.5 font-semibold text-orange-200 hover:bg-orange-900 hover:text-orange-100'
                      to='admin/reports'
                    >
                      Reports
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}

export default DashboardLayout
