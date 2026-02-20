import { apiClient } from './client'

apiClient.interceptors.request.use(
  (config) => {
    config.headers['X-App-Version'] = '1.0.0'
    // cookies are handled automatically by the browser
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    
    if (status === 401) {
      window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}/login`
    } else if (status === 403) {
      console.error('Access forbidden')
    } else if (status >= 500) {
      console.error('Server error occurred')
    }
    
    return Promise.reject(error)
  }
)