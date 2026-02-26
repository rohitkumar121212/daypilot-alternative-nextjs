// Development token - update this when needed
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1MzI0MjQwNzMxNTA0NjQwLCJlbWFpbCI6InN0YXlAdGhlc3F1YS5yZSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyMTE5NTg3LCJpYXQiOjE3NzIwOTA3ODd9.CWl7-V_KY5QKXB4Y3vJq7AH3sm_hAdzHYYsII1sAcWE'

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
