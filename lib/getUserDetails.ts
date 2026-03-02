import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'
const DEV_SESSION = '.eJxtUMtOxDAM_BXUI4LdNO_0hLhw5Q8qJ3VKpDStkhRphfh3UliQQFws2zMej_3WjT5jeemGmne868YwdUMHkiJHxhV6Zp2iBIWeuNNWUa0JANUSuDdWECsZ6VErIa002ig3yZ5a5Y3TRBktiOyZYdJaB4wazZjvPXWcWWM1UjCKSgXEMaokoUaBFT0q6JqRDfMCCVP9sbYXzFd_W6k5QHyYFwjx5NbFKyRtCqYlpE-OFILKnnMjNJeckG8swYJN4eCmNV0Oza_SRSilpT7CfHOE-9ke7T0fhKfH51b4EGvzYC-jxWmsl-2Quv0N7CFOIc1XIIYl1D-blj3WENc5pG7wEEu7bcv4Gta9jHuOjfRS61aG8xnaEzy6WipcThDObbhg9P8e-P4B0D-NQA.aZ74cA.z3eMZZ1fIXR4y-hSI5D-omfwgRc'

export async function getUserDetails() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (isDevelopment) {
    headers['Cookie'] = `session=${DEV_SESSION}`
  } else {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (sessionCookie) {
      headers['Cookie'] = `session=${sessionCookie.value}`
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/aps-api/v1/users/details/private`, {
      headers,
      credentials: 'include',
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch user details:', error)
    return null
  }
}
