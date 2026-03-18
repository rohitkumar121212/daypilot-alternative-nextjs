// Development token - update this when needed
const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN || ''
const isDevelopment = process.env.NODE_ENV === 'development'
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'
const LOGIN_URL = 'https://aperfectstay.ai/login/'

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

  try {
    const response = await fetch(fullUrl, {
      credentials: 'include',
      ...options,
      headers,
    })

    // Global 401 handling - redirect to login
    if (response.status === 401) {
      console.warn('Unauthorized access detected. Redirecting to login...')
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = LOGIN_URL
      }
      
      // Throw error to prevent further processing
      throw new Error('Unauthorized - redirecting to login')
    }

    // Handle other HTTP errors
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText} for ${fullUrl}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    // Re-throw 401 errors (already handled above)
    if (error.message?.includes('Unauthorized')) {
      throw error
    }
    
    // Handle network errors or other issues
    console.error('API Request failed:', error)
    throw error
  }
}
