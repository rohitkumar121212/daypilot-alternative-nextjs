'use client'

import { useUser } from '@/contexts/UserContext'
import { useEffect } from 'react'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://aperfectstay.ai'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && !user) {
      const nextUrl = encodeURIComponent(window.location.href)
      window.location.href = `${AUTH_URL}/login?next=${nextUrl}`
    }
  }, [isLoading, user])

  if (isLoading || !user) return null

  return <>{children}</>
}
