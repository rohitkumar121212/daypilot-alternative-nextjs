import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getUserDetails } from './getUserDetails'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://aperfectstay.ai'

/**
 * Call at the top of any protected Server Component page.
 * Validates the session against the user-details API and redirects to
 * login if the user is not authenticated.
 *
 * @param pathname - the current route path, e.g. '/pms-calendar'
 * @returns the validated user data
 */
export async function requireAuth(pathname: string) {
  const data = await getUserDetails()

  console.log('User details fetched in requireAuth:', data)
  if (!data?.data) {
    const headersList = await headers()
    console.log('Unauthenticated access attempt to', headersList.get('host') + pathname)
    const host = headersList.get('host') || ''
    const proto = headersList.get('x-forwarded-proto') || 'https'
    const nextUrl = encodeURIComponent(`${proto}://${host}${pathname}`)
    redirect(`${AUTH_URL}/login?next=${nextUrl}`)
  }

  return data?.data
}
