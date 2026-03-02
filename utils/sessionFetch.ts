// Development session - update this when needed
const DEV_SESSION = '.eJxtj8tqwzAQRX8leN0mGj2trJpS6DbQDwijlyOQbGPJhVD675Vb0kXpRtLMvXfm6KO7hMWXa3esy-ofukt03bEDhgS06xkhKrDecBDSSCfBgCN9cECcBSMlR8E4AUuVC0aIwIlqHcKkooDKEyJUu8EY5w2C4pR5dJKDNoR7yaA3QUpNeQ8cjPbWauGIFqJrILNfMo5-rL9oa_HLDx_Oxfk8UULZ05Axpr2dMlJJWxBdjuO3jute90xrkJw1zP6ujZh9G3I6v-1e2pTdydppbXuaPk7jbVvT5FbahKW0Z0g47LbjcTBbe102w-vzuRUp5lj_5PKaakzTEMc7-7z49zit5bIuqXmutc7leDhg-2TwtpaKtz3GQ8sWn8K_9J9fgJyBUA.aaVOhQ.lglCYxHhTlvG3Id80Urn0UNslBM'
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0Nzg5ODM5OTE2NDMzNDA4LCJlbWFpbCI6ImFwc2RlbW8yMDIzQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyNDcwMDE5LCJpYXQiOjE3NzI0NDEyMTl9.OWyrC1IQqbuQkC_K_4q_qN_JGzXk3bSoBIBM5dL_dHQ'

const isDevelopment = process.env.NODE_ENV === 'development'
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://aperfectstay.ai'

export async function sessionFetch(url: string, options: RequestInit = {}) {
  // In development, use proxy for case-accounts API
  if (isDevelopment && url.includes('case-accounts')) {
    const response = await fetch('/api/proxy/case-accounts', {
      ...options,
      credentials: 'include',
    })
    return response.json()
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Only add token in development
  if (isDevelopment) {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || DEV_TOKEN
      : DEV_TOKEN
    
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
