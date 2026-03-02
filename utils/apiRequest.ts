// Development token - update this when needed
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0Nzg5ODM5OTE2NDMzNDA4LCJlbWFpbCI6ImFwc2RlbW8yMDIzQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyNDcwMDE5LCJpYXQiOjE3NzI0NDEyMTl9.OWyrC1IQqbuQkC_K_4q_qN_JGzXk3bSoBIBM5dL_dHQ'

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
