// Development token - update this when needed
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2NTUyNjE0NDk1ODQ2NDAwLCJlbWFpbCI6ImFwc3RyaWFsQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyMTI2MTgyLCJpYXQiOjE3NzIwOTczODJ9._n-ZVackxZsj4w7hcrThIq_9GalYsv5ULqQBY1bw7LU'

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
