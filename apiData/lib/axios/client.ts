import axios from 'axios'

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined')
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})