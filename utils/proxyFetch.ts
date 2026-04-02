const isDevelopment = process.env.NODE_ENV === 'development'
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'
const LOGIN_URL = 'https://aperfectstay.ai/login/'

const PROXY_ROUTES: Record<string, string> = {
  '/aps-api/v1/case-accounts/': '/api/proxy/case-accounts',
  '/aps-api/v1/users/details/private': '/api/proxy/user-details',
  '/aps-api/v1/guests/': '/api/proxy/guests',
  '/aps-api/v1/taxsets/': '/api/proxy/taxsets',
  '/api/aperfect-pms/share-payment-link': '/api/proxy/share-payment-link',
  '/api/aperfect-pms/change-property-cleaning-status': '/api/proxy/change-property-cleaning-status',
  '/api/aperfect-pms/fetch-property-address-and-details': '/api/proxy/fetch-property-address-and-details',
}

export async function proxyFetch(url: string, options: RequestInit = {}) {
  let response: Response

  try {
    // In development, check if this URL has a proxy route
    if (isDevelopment) {
      const proxyRoute = PROXY_ROUTES[url]
      if (proxyRoute) {
        response = await fetch(proxyRoute, {
          ...options,
          credentials: 'include',
        })
      } else {
        // In production or if no proxy route, call API directly
        const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
        response = await fetch(fullUrl, {
          credentials: 'include',
          ...options,
        })
      }
    } else {
      // In production, call API directly
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
      response = await fetch(fullUrl, {
        credentials: 'include',
        ...options,
      })
    }

    // Global 401 handling - redirect to login
    if (response.status === 401) {
      console.warn('Unauthorized access detected in proxyFetch. Redirecting to login...')
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = LOGIN_URL
      }
      
      // Throw error to prevent further processing
      throw new Error('Unauthorized - redirecting to login')
    }

    // Handle other HTTP errors
    if (!response.ok) {
      console.error(`ProxyFetch Error: ${response.status} ${response.statusText} for ${url}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    // Re-throw 401 errors (already handled above)
    if (error.message?.includes('Unauthorized')) {
      throw error
    }
    
    // Handle network errors or other issues
    console.error('ProxyFetch Request failed:', error)
    throw error
  }
}
