'use client'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'

export function AuthProvider({
  children,
  session
}: {
  children: React.ReactNode
  session?: Session | null
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60} // Refresh session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
