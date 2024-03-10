import { cssBundleHref } from '@remix-run/css-bundle'
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'

import faviconAssetUrl from '~/assets/favicon.svg'
import tailwindStylesheetLink from '~/styles/tailwind.css'

import { StaffRoles, WORKER_ROLE } from './constants'
import { prisma } from './libs'
import { authSessionStorage, useOptionalUser } from './utils'

export const links: LinksFunction = () => {
  return [
    { rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
    { rel: 'stylesheet', href: tailwindStylesheetLink },
    ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSession = await authSessionStorage.getSession(request.headers.get('Cookie'))
  const userId = (authSession.get('userId') as string) ?? ''
  const user = await prisma.user.findUnique({
    select: { id: true, username: true, role: { select: { name: true } } },
    where: { id: userId }
  })

  return json({ user })
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Efficient Downtime Reporting Application for Logistics: LogiProdReport' },
    {
      name: 'description',
      content: `LogiProdReport is a powerful downtime reporting application designed specifically for the logistics industry. Streamline your operations with our intuitive platform, allowing employees to report downtime efficiently and accurately. With transparent validation processes and manager approvals, LogiProdReport ensures smooth workflow management, leading to optimized productivity and bonus allocation decisions.`
    }
  ]
}

const Document = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang='en' className='h-full overflow-x-hidden'>
      <head>
        <Meta />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Links />
      </head>
      <body className='flex h-full flex-col justify-between'>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const App = () => {
  const user = useOptionalUser()
  const role = user?.role.name ?? ''
  const isWorker = role === WORKER_ROLE
  const isStaff = (Object.values(StaffRoles) as string[]).includes(role)

  return (
    <Document>
      <header className='bg-orange-800 py-4 sm:px-6 lg:px-8'>
        <nav className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
          <div className='flex w-auto flex-shrink-0 items-center'>
            <Link to='/' className='text-xl font-bold'>
              Logi Prod Report
            </Link>
          </div>
          <div className='hidden sm:ml-6 sm:block'>
            <ul className='flex items-center space-x-4'>
              <li>
                <Link className='px-3 py-2' to='/about'>
                  About
                </Link>
              </li>
              {user ? (
                <>
                  {isStaff && (
                    <li>
                      <Link className='px-3 py-2' to='/dashboard'>
                        Dashboard
                      </Link>
                    </li>
                  )}
                  {isWorker && (
                    <li>
                      <Link className='px-3 py-2' to='/profile'>
                        Profile
                      </Link>
                    </li>
                  )}
                  <li>
                    <Form action='/logout' method='POST'>
                      <button type='submit' className='px-3 py-2'>
                        Logout
                      </button>
                    </Form>
                  </li>
                </>
              ) : (
                <li>
                  <NavLink className='px-3 py-2' to='/login'>
                    Login
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>
      <main className='flex-1'>
        <Outlet />
      </main>
      <footer className='bg-orange-800 px-2 py-4 text-center'>
        <nav className='flex justify-center'>
          <Link to='/' className='font-bold'>
            Logi Prod Report
          </Link>
          <span className='mx-1'>|</span>
          <p>Coded with love and lot of coffee by Titux Metal</p>
        </nav>
      </footer>
    </Document>
  )
}

const AppWithProviders = () => {
  return <App />
}

export const ErrorBoundary = () => {
  return (
    <Document>
      <main className='flex-1'>Here goes the General Error Boundary</main>
    </Document>
  )
}

export default AppWithProviders
