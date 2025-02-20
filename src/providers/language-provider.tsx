'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Messages {
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
    loading: string
    error: string
    tabs: {
      overview: string
      analytics: string
      backlinks: string
      keywords: string
      content: string
      technical: string
      settings: string
    }
    addProject: string
    errors: {
      loading: string
      loadingDesc: string
      creating: string
    }
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
    analytics: {
      title: string
      description: string
      actions: {
        refresh: string
        configure: string
        reconfigure: string
      }
      errors: {
        auth: {
          title: string
          description: string
        }
        refresh: {
          title: string
          description: string
        }
      }
      success: {
        refresh: {
          title: string
          description: string
        }
      }
      timeperiods: {
        "7d": string
        "30d": string
        "90d": string
        "180d": string
        "365d": string
      }
      metrics: {
        comparison: string
        users: {
          title: string
          tooltip: string
        }
        pageViews: {
          title: string
          tooltip: string
        }
        sessionDuration: {
          title: string
          tooltip: string
        }
        bounceRate: {
          title: string
          tooltip: string
        }
      }
      search: {
        title: string
        metrics: {
          clicks: {
            title: string
            tooltip: string
          }
          impressions: {
            title: string
            tooltip: string
          }
          ctr: {
            title: string
            tooltip: string
          }
          position: {
            title: string
            tooltip: string
          }
        }
      }
      sections: {
        behavior: string
        topPages: {
          title: string
          views: string
          noData: string
        }
        trafficSources: {
          title: string
          users: string
          noData: string
        }
      }
      configuration: {
        title: string
        gaProperty: string
        gscSite: string
        notConfigured: string
      }
    }
    backlinks: {
      loading: {
        state1: string
        state2: string
        state3: string
      }
      error: string
      empty: {
        title: string
        description: string
      }
      metrics: {
        activeBacklinks: string
        avgDomainAuthority: string
        newThisMonth: string
        lostLinks: string
      }
      table: {
        title: string
        description: string
        columns: {
          url: string
          target: string
          anchor: string
          da: string
          type: string
          status: string
          firstSeen: string
          actions: string
        }
        filter: {
          label: string
          all: string
          active: string
          lost: string
          broken: string
        }
      }
      tooltips: {
        status: {
          active: string
          lost: string
          broken: string
        }
        type: {
          dofollow: string
          nofollow: string
          ugc: string
          sponsored: string
        }
      }
      actions: {
        add: string
        edit: string
        delete: string
        recheckAll: string
        recheck: string
      }
      deleteDialog: {
        title: string
        description: string
        cancel: string
        confirm: string
      }
      toast: {
        deleteSuccess: {
          title: string
          description: string
        }
        deleteError: {
          title: string
          description: string
        }
      }
    }
    overview: {
      loading: string
      metrics: {
        avgKeywordRank: string
        totalBacklinks: string
        contentScore: string
        technicalScore: string
        lastMonth: string
      }
      sections: {
        topKeywords: {
          title: string
          position: string
        }
        recentBacklinks: {
          title: string
          da: string
        }
        technicalIssues: {
          title: string
          issues: {
            missingMeta: string
            slowLoading: string
            missingAlt: string
          }
        }
      }
    }
  }
}

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  messages: Messages
}

const createEmptyMessages = (): Messages => ({
  settings: {
    title: '',
    userPreferences: '',
    timezone: '',
    language: '',
    notifications: {
      title: '',
      email: { title: '', description: '' },
      weeklyReports: { title: '', description: '' }
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
    auth: { signIn: '', register: '' },
    hero: {
      title: '',
      subtitle: '',
      description: '',
      cta: { getStarted: '', learnMore: '' }
    },
    features: {
      title: '',
      subtitle: '',
      description: '',
      items: []
    },
    footer: { copyright: '' }
  },
  projects: {
    title: '',
    loading: '',
    error: '',
    tabs: {
      overview: '',
      analytics: '',
      backlinks: '',
      keywords: '',
      content: '',
      technical: '',
      settings: ''
    },
    addProject: '',
    errors: {
      loading: '',
      loadingDesc: '',
      creating: ''
    },
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
    },
    analytics: {
      title: '',
      description: '',
      actions: {
        refresh: '',
        configure: '',
        reconfigure: ''
      },
      errors: {
        auth: { title: '', description: '' },
        refresh: { title: '', description: '' }
      },
      success: {
        refresh: { title: '', description: '' }
      },
      timeperiods: {
        "7d": '',
        "30d": '',
        "90d": '',
        "180d": '',
        "365d": ''
      },
      metrics: {
        comparison: '',
        users: { title: '', tooltip: '' },
        pageViews: { title: '', tooltip: '' },
        sessionDuration: { title: '', tooltip: '' },
        bounceRate: { title: '', tooltip: '' }
      },
      search: {
        title: '',
        metrics: {
          clicks: { title: '', tooltip: '' },
          impressions: { title: '', tooltip: '' },
          ctr: { title: '', tooltip: '' },
          position: { title: '', tooltip: '' }
        }
      },
      sections: {
        behavior: '',
        topPages: { title: '', views: '', noData: '' },
        trafficSources: { title: '', users: '', noData: '' }
      },
      configuration: {
        title: '',
        gaProperty: '',
        gscSite: '',
        notConfigured: ''
      }
    },
    backlinks: {
      loading: {
        state1: '',
        state2: '',
        state3: ''
      },
      error: '',
      empty: {
        title: '',
        description: ''
      },
      metrics: {
        activeBacklinks: '',
        avgDomainAuthority: '',
        newThisMonth: '',
        lostLinks: ''
      },
      table: {
        title: '',
        description: '',
        columns: {
          url: '',
          target: '',
          anchor: '',
          da: '',
          type: '',
          status: '',
          firstSeen: '',
          actions: ''
        },
        filter: {
          label: '',
          all: '',
          active: '',
          lost: '',
          broken: ''
        }
      },
      tooltips: {
        status: {
          active: '',
          lost: '',
          broken: ''
        },
        type: {
          dofollow: '',
          nofollow: '',
          ugc: '',
          sponsored: ''
        }
      },
      actions: {
        add: '',
        edit: '',
        delete: '',
        recheckAll: '',
        recheck: ''
      },
      deleteDialog: {
        title: '',
        description: '',
        cancel: '',
        confirm: ''
      },
      toast: {
        deleteSuccess: {
          title: '',
          description: ''
        },
        deleteError: {
          title: '',
          description: ''
        }
      }
    },
    overview: {
      loading: '',
      metrics: {
        avgKeywordRank: '',
        totalBacklinks: '',
        contentScore: '',
        technicalScore: '',
        lastMonth: ''
      },
      sections: {
        topKeywords: {
          title: '',
          position: ''
        },
        recentBacklinks: {
          title: '',
          da: ''
        },
        technicalIssues: {
          title: '',
          issues: {
            missingMeta: '',
            slowLoading: '',
            missingAlt: ''
          }
        }
      }
    }
  }
})

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  messages: createEmptyMessages()
})

export const useLanguage = () => useContext(LanguageContext)

const loadStoredLanguage = (): string => {
  if (typeof window === 'undefined') return 'en'
  return localStorage.getItem('preferredLanguage') || 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => loadStoredLanguage())
  const [messages, setMessages] = useState<Messages>(createEmptyMessages())

  const setLanguage = (newLanguage: string) => {
    localStorage.setItem('preferredLanguage', newLanguage)
    setLanguageState(newLanguage)
  }

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
