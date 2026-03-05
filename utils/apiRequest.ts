// Development token - update this when needed
const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN || ''
const isDevelopment = process.env.NODE_ENV === 'development'
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'

export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  // Only add token in development
  if (isDevelopment) {
    const token =  DEV_TOKEN
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
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
