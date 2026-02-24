import axios from 'axios'

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined')
}

const isClient = typeof window !== 'undefined'
const baseURL = isClient ? '/api/proxy' : process.env.NEXT_PUBLIC_API_BASE_URL

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: (params) => {
    if (isClient && params) {
      return new URLSearchParams(params).toString()
    }
    return ''
  },
})

if (isClient) {
  apiClient.interceptors.request.use((config) => {
    if (config.url && !config.url.startsWith('?')) {
      config.url = `?path=${encodeURIComponent(config.url)}`
    }
    return config
  })
}