import { useError } from '@/contexts/ErrorContext'

// Enhanced API utilities that integrate with global error modal
export const useApiWithErrorHandling = () => {
  const { showError } = useError()

  const handleApiError = (error: any, endpoint: string, statusCode?: number) => {
    let title = 'Request Failed'
    let message = 'Something went wrong. Please try again.'

    // Customize error messages based on status codes
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

    showError({
      title,
      message,
      statusCode,
      endpoint
    })
  }

  const enhancedApiFetch = async (url: string, options: RequestInit = {}) => {
    const { apiFetch } = await import('@/utils/apiRequest')
    
    try {
      return await apiFetch(url, options)
    } catch (error: any) {
      // Extract status code from error message if available
      const statusMatch = error.message?.match(/HTTP (\\d+):/)
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined
      
      handleApiError(error, url, statusCode)
      throw error // Re-throw so calling code can handle it if needed
    }
  }

  const enhancedProxyFetch = async (url: string, options: RequestInit = {}) => {
    const { proxyFetch } = await import('@/utils/proxyFetch')
    
    try {
      return await proxyFetch(url, options)
    } catch (error: any) {
      const statusMatch = error.message?.match(/HTTP (\\d+):/)
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : undefined
      
      handleApiError(error, url, statusCode)
      throw error
    }
  }

  return {
    apiFetch: enhancedApiFetch,
    proxyFetch: enhancedProxyFetch
  }
}