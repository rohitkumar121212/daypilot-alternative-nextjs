'use client'

import { proxyFetch } from '@/utils/proxyFetch'
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  permissions?: string[]
  // Add other user properties as needed
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isSquareUser, setIsSquareUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await proxyFetch('/aps-api/v1/users/details/private')
      console.log('Fetched user data:', data?.data)
      setUser(data?.data?.user_details || null)
      if(data?.data?.user_details?.email==='stay@thesqua.re' || data?.data?.user_details?.email==='apsdemo2023@gmail.com'){
        setIsSquareUser(true)
      } else {
        setIsSquareUser(false)
      }

    } catch (err) {
      console.error('Failed to fetch user:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const logout = () => {
    setUser(null)
    setError(null)
    // Add any logout logic here (clear tokens, redirect, etc.)
  }

  useEffect(() => {
    fetchUser()
  }, [])

 const value = useMemo(
  () => ({
    user,
    isSquareUser,
    isLoading,
    error,
    refreshUser,
    logout
  }),
  [user, isLoading, error]
)

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}