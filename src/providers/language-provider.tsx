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
  dashboard: {
    welcome: string
    overview: string
    refresh: string
    stats: {
      totalProjects: string
      averagePosition: string
      lastMonth: string
      averagePositionTooltip: string
    }
    recentProjects: {
      title: string
      viewAll: string
      loadError: string
      noProjects: string
      createFirst: string
      lastUpdated: string
      status: string
    }
  }
  navigation: {
    title: string
    dashboard: string
    projects: string
    settings: string
    signOut: string
    signingOut: string
  }
  landing: {
    auth: {
      signIn: string
      register: string
    }
    hero: {
      title: string
      subtitle: string
      description: string
      cta: {
        getStarted: string
        learnMore: string
      }
    }
    features: {
      title: string
      subtitle: string
      description: string
      items: Array<{
        title: string
        description: string
      }>
    }
    footer: {
      copyright: string
    }
  }
  projects: {
    title: string
    addProject: string
    errors: {
      loading: string
      loadingDesc: string
      creating: string
    }
    loading: string
    empty: string
    status: string
    form: {
      name: string
      nameDesc: string
      url: string
      urlDesc: string
      gaProperty: string
      gaPropertyDesc: string
      gscSite: string
      gscSiteDesc: string
      submit: string
      cancel: string
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
    },
    dashboard: {
      welcome: '',
      overview: '',
      refresh: '',
      stats: {
        totalProjects: '',
        averagePosition: '',
        lastMonth: '',
        averagePositionTooltip: ''
      },
      recentProjects: {
        title: '',
        viewAll: '',
        loadError: '',
        noProjects: '',
        createFirst: '',
        lastUpdated: '',
        status: ''
      }
    },
    navigation: {
      title: '',
      dashboard: '',
      projects: '',
      settings: '',
      signOut: '',
      signingOut: ''
    },
    landing: {
      auth: {
        signIn: '',
        register: ''
      },
      hero: {
        title: '',
        subtitle: '',
        description: '',
        cta: {
          getStarted: '',
          learnMore: ''
        }
      },
      features: {
        title: '',
        subtitle: '',
        description: '',
        items: []
      },
      footer: {
        copyright: ''
      }
    },
    projects: {
      title: '',
      addProject: '',
      errors: {
        loading: '',
        loadingDesc: '',
        creating: ''
      },
      loading: '',
      empty: '',
      status: '',
      form: {
        name: '',
        nameDesc: '',
        url: '',
        urlDesc: '',
        gaProperty: '',
        gaPropertyDesc: '',
        gscSite: '',
        gscSiteDesc: '',
        submit: '',
        cancel: ''
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
    },
    dashboard: {
      welcome: '',
      overview: '',
      refresh: '',
      stats: {
        totalProjects: '',
        averagePosition: '',
        lastMonth: '',
        averagePositionTooltip: ''
      },
      recentProjects: {
        title: '',
        viewAll: '',
        loadError: '',
        noProjects: '',
        createFirst: '',
        lastUpdated: '',
        status: ''
      }
    },
    navigation: {
      title: '',
      dashboard: '',
      projects: '',
      settings: '',
      signOut: '',
      signingOut: ''
    },
    landing: {
      auth: {
        signIn: '',
        register: ''
      },
      hero: {
        title: '',
        subtitle: '',
        description: '',
        cta: {
          getStarted: '',
          learnMore: ''
        }
      },
      features: {
        title: '',
        subtitle: '',
        description: '',
        items: []
      },
      footer: {
        copyright: ''
      }
    },
    projects: {
      title: '',
      addProject: '',
      errors: {
        loading: '',
        loadingDesc: '',
        creating: ''
      },
      loading: '',
      empty: '',
      status: '',
      form: {
        name: '',
        nameDesc: '',
        url: '',
        urlDesc: '',
        gaProperty: '',
        gaPropertyDesc: '',
        gscSite: '',
        gscSiteDesc: '',
        submit: '',
        cancel: ''
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