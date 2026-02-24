const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    
    // Try to get from cookie first (future implementation)
    const cookieToken = getCookie(ACCESS_TOKEN_KEY)
    if (cookieToken) return cookieToken
    
    // Fallback to localStorage for manual testing
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    
    const cookieToken = getCookie(REFRESH_TOKEN_KEY)
    if (cookieToken) return cookieToken
    
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  
  return null
}
