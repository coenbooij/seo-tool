'use client'

import Sidebar from '@/components/navigation/sidebar'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { LanguageProvider } from '@/providers/language-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-primary-50">
        <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
          <Sidebar />
        </div>
        <div className="pl-72">
          <main className="min-h-screen py-10">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </LanguageProvider>
  )
}
