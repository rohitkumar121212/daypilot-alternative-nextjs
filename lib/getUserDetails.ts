import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'

export async function getUserDetails() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (isDevelopment) {
    const devSession = process.env.DEV_SESSION
    const devToken = process.env.DEV_TOKEN
    console.log('[getUserDetails] DEV_SESSION present:', !!devSession)
    console.log('[getUserDetails] DEV_TOKEN present:', !!devToken)
    if (!devSession) {
      console.warn('[getUserDetails] DEV_SESSION is not set in .env.local — restart the dev server if you just added it')
    } else {
      headers['Cookie'] = `session=${devSession}`
    }
    if (devToken) {
      headers['Authorization'] = `Bearer ${devToken}`
    }
  } else {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    console.log('[getUserDetails] Production session cookie present:', !!sessionCookie?.value)
    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`
    }
  }

  console.log('[getUserDetails] Outgoing headers:', JSON.stringify({
    'Content-Type': (headers as Record<string, string>)['Content-Type'],
    'Cookie': (headers as Record<string, string>)['Cookie'] ? 'session=<present>' : 'not set',
    'Authorization': (headers as Record<string, string>)['Authorization'] ? 'Bearer <present>' : 'not set',
  }))

  try {
    const response = await fetch(`${BASE_URL}/aps-api/v1/users/details/private`, {
      headers,
      cache: 'no-store'
    })

    console.log('[getUserDetails] Response status:', response.status, response.statusText)

    if (!response.ok) {
      if (isDevelopment) {
        console.warn(`[getUserDetails] API returned ${response.status} — DEV_SESSION is likely expired. Paste a fresh value from your browser into .env.local and restart the dev server.`)
      }
      return null
    }

    const data = await response.json()
    console.log('[getUserDetails] Response data:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('Failed to fetch user details:', error)
    return null
  }
}
