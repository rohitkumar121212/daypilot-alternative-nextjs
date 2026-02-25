// Development token - update this when needed
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2NTUyNjE0NDk1ODQ2NDAwLCJlbWFpbCI6ImFwc3RyaWFsQGdtYWlsLmNvbSIsInVzZXJfdHlwZSI6MSwiZXhwIjoxNzcyMDUzNDYzLCJpYXQiOjE3NzIwMjQ2NjN9.8hJmB4VAdRmKE0e9NzbJsL8vk6Ujz0TCqAsbU9Mz9YA'

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token =  DEV_TOKEN
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  })

  return response.json()
}
