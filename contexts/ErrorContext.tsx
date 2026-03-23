'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface ErrorDetails {
  title: string
  message: string
  statusCode?: number
  endpoint?: string
  timestamp?: Date
}

interface ErrorContextType {
  showError: (error: ErrorDetails) => void
  hideError: () => void
  error: ErrorDetails | null
  isVisible: boolean
}

const ErrorContext = createContext<ErrorContextType | null>(null)

interface ErrorProviderProps {
  children: ReactNode
}

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showError = (errorDetails: ErrorDetails) => {
    setError({
      ...errorDetails,
      timestamp: new Date()
    })
    setIsVisible(true)
  }

  const hideError = () => {
    setIsVisible(false)
    // Clear error after animation completes
    setTimeout(() => setError(null), 300)
  }

  return (
    <ErrorContext.Provider value={{ showError, hideError, error, isVisible }}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}