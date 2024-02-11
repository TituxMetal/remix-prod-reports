import { cssBundleHref } from '@remix-run/css-bundle'
import { type LinksFunction, type MetaFunction } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

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
      <header>LogiProdReport</header>
      <main className='flex-1'>
        <Outlet />
      </main>
      <footer>LogiProdReport</footer>
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
