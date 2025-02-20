'use client'

import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { useLanguage } from '@/providers/language-provider'

interface NavigationItem {
  name: string
  href: string
  icon: string
}

const createNavigation = (messages: { navigation: { dashboard: string; projects: string; settings: string } }): NavigationItem[] => [
  { 
    name: messages.navigation.dashboard, 
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  { 
    name: messages.navigation.projects, 
    href: '/dashboard/projects',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  { 
    name: messages.navigation.settings, 
    href: '/dashboard/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { messages } = useLanguage()

  const projectId = params?.id as string
  const globalNavigation = createNavigation(messages)
  const navigation = projectId
    ? globalNavigation.map(item => ({
        ...item,
        href: item.href.replace('[id]', projectId),
      }))
    : globalNavigation

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 w-64">
      <div className="flex items-center justify-center h-16 px-4 bg-slate-900/50">
        <Link href="/dashboard">
          <h1 className="text-slate-50 text-xl font-bold cursor-pointer hover:text-white transition-colors">{messages.navigation.title}</h1>
        </Link>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-slate-700/50 text-white shadow-lg'
                  : 'text-slate-100 hover:bg-slate-700/30 hover:text-white'
              } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ease-in-out`}
            >
              <svg
                className={`${
                  isActive ? 'text-slate-200' : 'text-slate-300 group-hover:text-slate-200'
                } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="flex-shrink-0 flex border-t border-slate-700/50 p-4">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex-shrink-0 w-full group block"
        >
          <div className="flex items-center">
            <div>
              <svg
                className="text-slate-300 group-hover:text-slate-200 mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div className="text-sm font-medium text-slate-100 group-hover:text-white transition-colors">
              {isSigningOut ? messages.navigation.signingOut : messages.navigation.signOut}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
