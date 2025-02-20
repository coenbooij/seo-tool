'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Messages {
  settings: {
    title: string
    userPreferences: string
    timezone: string
    language: string
    notifications: {
      title: string
      email: {
        title: string
        description: string
      }
      weeklyReports: {
        title: string
        description: string
      }
    }
  }
}

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  messages: Messages
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  messages: {
    settings: {
      title: '',
      userPreferences: '',
      timezone: '',
      language: '',
      notifications: {
        title: '',
        email: {
          title: '',
          description: ''
        },
        weeklyReports: {
          title: '',
          description: ''
        }
      }
    }
  }
})

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en')
  const [messages, setMessages] = useState<Messages>({
    settings: {
      title: '',
      userPreferences: '',
      timezone: '',
      language: '',
      notifications: {
        title: '',
        email: {
          title: '',
          description: ''
        },
        weeklyReports: {
          title: '',
          description: ''
        }
      }
    }
  })

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messages = await import(`@/messages/${language}.json`)
        setMessages(messages.default)
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    }
    loadMessages()
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, messages }}>
      {children}
    </LanguageContext.Provider>
  )
}