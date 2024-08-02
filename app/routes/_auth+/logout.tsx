import { redirect, type ActionFunctionArgs } from '@remix-run/node'

import { logout } from '~/utils/auth.server'

export const loader = () => {
  return redirect('/')
}

export const action = async ({ request }: ActionFunctionArgs) => {
  throw await logout(request)
}
