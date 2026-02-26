// Development token - update this when needed
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2NTUyNjE0NDk1ODQ2NDAwLCJlbWFpbCI6ImFwc3RyaWFsQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyMTMwMDE4LCJpYXQiOjE3NzIxMDEyMTh9.y6FyeJET7oqO_MN3eDBnPXKk9O4vU1aqcBqxDI_-Zfk'

const isDevelopment = process.env.NODE_ENV === 'development'

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

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  })

  return response.json()
}
