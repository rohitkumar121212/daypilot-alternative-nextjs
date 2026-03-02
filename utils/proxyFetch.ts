const isDevelopment = process.env.NODE_ENV === 'development'
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'

// Map of API endpoints to their proxy routes
const PROXY_ROUTES: Record<string, string> = {
  '/aps-api/v1/case-accounts/': '/api/proxy/case-accounts',
  '/aps-api/v1/users/details/private': '/api/proxy/user-details',
}

export async function proxyFetch(url: string, options: RequestInit = {}) {
  // In development, check if this URL has a proxy route
  if (isDevelopment) {
    const proxyRoute = PROXY_ROUTES[url]
    if (proxyRoute) {
      const response = await fetch(proxyRoute, {
        ...options,
        credentials: 'include',
      })
      return response.json()
    }
  }

  // In production or if no proxy route, call API directly
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`

  const response = await fetch(fullUrl, {
    credentials: 'include',
    ...options,
  })

  return response.json()
}
