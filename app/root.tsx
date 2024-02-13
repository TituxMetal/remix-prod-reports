import { cssBundleHref } from '@remix-run/css-bundle'
import { type LinksFunction, type MetaFunction } from '@remix-run/node'
import {
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

export const links: LinksFunction = () => {
  return [
    { rel: 'icon', type: 'image/svg+xml', href: faviconAssetUrl },
    { rel: 'stylesheet', href: tailwindStylesheetLink },
    ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : [])
  ]
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
  return (
    <Document>
      <header className='bg-orange-800 px-2 py-4'>
        <nav className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
          <div className='flex w-auto flex-shrink-0 items-center'>
            <Link to='/' className='text-xl font-bold'>
              Logi Prod Report
            </Link>
          </div>
          <div className='hidden sm:ml-6 sm:block'>
            <ul className='flex space-x-4'>
              <li>
                <NavLink className='rounded-md px-3 py-2' to='/login'>
                  Login
                </NavLink>
              </li>
              <li>
                <Link className='rounded-md px-3 py-2' to='/about'>
                  About
                </Link>
              </li>
              <li>
                <Link className='rounded-md px-3 py-2' to='/dashboard'>
                  Dashboard
                </Link>
              </li>
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
