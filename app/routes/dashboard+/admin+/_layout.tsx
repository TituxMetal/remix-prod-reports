import { type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'

import { requireAdminUser } from '~/utils/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request)

  return {}
}

const AdminLayout = () => {
  return <Outlet />
}

export default AdminLayout
