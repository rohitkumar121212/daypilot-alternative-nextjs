// Development session - update this when needed
const DEV_SESSION = '.eJxtUMtOxDAM_BXUI4LdNO_0hLhw5Q8qJ3VKpDStkhRphfh3UliQQFws2zMej_3WjT5jeemGmne868YwdUMHkiJHxhV6Zp2iBIWeuNNWUa0JANUSuDdWECsZ6VErIa002ig3yZ5a5Y3TRBktiOyZYdJaB4wazZjvPXWcWWM1UjCKSgXEMaokoUaBFT0q6JqRDfMCCVP9sbYXzFd_W6k5QHyYFwjx5NbFKyRtCqYlpE-OFILKnnMjNJeckG8swYJN4eCmNV0Oza_SRSilpT7CfHOE-9ke7T0fhKfH51b4EGvzYC-jxWmsl-2Quv0N7CFOIc1XIIYl1D-blj3WENc5pG7wEEu7bcv4Gta9jHuOjfRS61aG8xnaEzy6WipcThDObbhg9P8e-P4B0D-NQA.aZ74cA.z3eMZZ1fIXR4y-hSI5D-omfwgRc'

const isDevelopment = process.env.NODE_ENV === 'development'
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'

export async function sessionFetch(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Only add session in development
  if (isDevelopment) {
    const session = typeof window !== 'undefined'
      ? localStorage.getItem('session') || DEV_SESSION
      : DEV_SESSION

    if (session) {
      headers['Cookie'] = `session=${session}`
    }
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  const response = await fetch(fullUrl, {
    credentials: 'include',
    ...options,
    headers,
  })

  return response.json()
}
