'use client'

import Header from './Header'

interface HeaderWrapperProps {
  user: any
}

export default function HeaderWrapper({ user }: HeaderWrapperProps) {
  return <Header user={user} />
}
