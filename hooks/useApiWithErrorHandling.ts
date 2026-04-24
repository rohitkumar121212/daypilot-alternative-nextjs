import { useError } from '@/contexts/ErrorContext'
import { fetchUtils } from '@/utils/fetchUtils'

export const useApiWithErrorHandling = () => {
  const { showError } = useError()

  const handleApiError = (error: any, endpoint: string, statusCode?: number) => {
    let title = 'Request Failed'
    let message = 'Something went wrong. Please try again.'

    if (statusCode === 401) {
      title = 'Authentication Required'
      message = 'Your session has expired. Please log in again.'
    } else if (statusCode === 403) {
      title = 'Access Denied'
      message = 'You don\'t have permission to perform this action.'
    } else if (statusCode === 404) {
      title = 'Not Found'
      message = 'The requested resource could not be found.'
    } else if (statusCode === 500) {
      title = 'Server Error'
      message = 'Internal server error. Please try again later.'
    } else if (statusCode && statusCode >= 400) {
      title = `Error ${statusCode}`
      message = error.message || 'An error occurred while processing your request.'
    } else if (error.message?.includes('Failed to fetch')) {
      title = 'Network Error'
      message = 'Unable to connect to the server. Please check your internet connection.'
    }

    showError({ title, message, statusCode, endpoint })
  }

  const withErrorHandling = async <T>(fn: () => Promise<T>, url: string): Promise<T> => {
    try {
      return await fn()
    } catch (error: any) {
      const statusMatch = error.message?.match(/HTTP (\d+):/)
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined
      handleApiError(error, url, statusCode)
      throw error
    }
  }

  return {
    get: (url: string, config?: RequestInit) =>
      withErrorHandling(() => fetchUtils.get(url, config), url),
    post: (url: string, data?: any, config?: RequestInit) =>
      withErrorHandling(() => fetchUtils.post(url, data, config), url),
    put: (url: string, data?: any, config?: RequestInit) =>
      withErrorHandling(() => fetchUtils.put(url, data, config), url),
    delete: (url: string, config?: RequestInit) =>
      withErrorHandling(() => fetchUtils.delete(url, config), url),
  }
}