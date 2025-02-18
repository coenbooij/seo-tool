export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          url: string
          domain: string | null
          sitemapUrl: string | null
          gaPropertyId: string | null
          gscVerifiedSite: string | null
          createdAt: string
          updatedAt: string
          userId: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          domain?: string | null
          sitemapUrl?: string | null
          gaPropertyId?: string | null
          gscVerifiedSite?: string | null
          createdAt?: string
          updatedAt?: string
          userId: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          domain?: string | null
          sitemapUrl?: string | null
          gaPropertyId?: string | null
          gscVerifiedSite?: string | null
          createdAt?: string
          updatedAt?: string
          userId?: string
        }
      }
      backlinks: {
        Row: {
          id: string
          url: string
          targetUrl: string
          anchorText: string
          domainAuthority: number
          type: string
          status: string
          firstSeen: string
          lastChecked: string | null
          projectId: string
          createdAt: string
          updatedAt: string
          authority: number
        }
        Insert: {
          id?: string
          url: string
          targetUrl: string
          anchorText: string
          domainAuthority?: number
          type?: string
          status?: string
          firstSeen?: string
          lastChecked?: string | null
          projectId: string
          createdAt?: string
          updatedAt?: string
          authority?: number
        }
        Update: {
          id?: string
          url?: string
          targetUrl?: string
          anchorText?: string
          domainAuthority?: number
          type?: string
          status?: string
          firstSeen?: string
          lastChecked?: string | null
          projectId?: string
          createdAt?: string
          updatedAt?: string
          authority?: number
        }
      }
      keywords: {
        Row: {
          id: string
          keyword: string
          intent: string
          searchVolume: number
          difficulty: number
          competition: number
          currentRank: number
          bestRank: number
          url: string | null
          source: string
          seasonality: Json | null
          serpFeatures: string[]
          contentStatus: string
          contentPriority: number | null
          contentType: string | null
          contentBrief: string | null
          clusterName: string | null
          clusterScore: number | null
          parentKeyword: string | null
          trends: Json | null
          notes: string | null
          projectId: string
          createdAt: string
          updatedAt: string
          keywordGroupId: string | null
        }
        Insert: {
          id?: string
          keyword: string
          intent?: string
          searchVolume?: number
          difficulty?: number
          competition?: number
          currentRank?: number
          bestRank?: number
          url?: string | null
          source?: string
          seasonality?: Json | null
          serpFeatures?: string[]
          contentStatus?: string
          contentPriority?: number | null
          contentType?: string | null
          contentBrief?: string | null
          clusterName?: string | null
          clusterScore?: number | null
          parentKeyword?: string | null
          trends?: Json | null
          notes?: string | null
          projectId: string
          createdAt?: string
          updatedAt?: string
          keywordGroupId?: string | null
        }
        Update: {
          id?: string
          keyword?: string
          intent?: string
          searchVolume?: number
          difficulty?: number
          competition?: number
          currentRank?: number
          bestRank?: number
          url?: string | null
          source?: string
          seasonality?: Json | null
          serpFeatures?: string[]
          contentStatus?: string
          contentPriority?: number | null
          contentType?: string | null
          contentBrief?: string | null
          clusterName?: string | null
          clusterScore?: number | null
          parentKeyword?: string | null
          trends?: Json | null
          notes?: string | null
          projectId?: string
          createdAt?: string
          updatedAt?: string
          keywordGroupId?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      KeywordIntent: 'INFORMATIONAL' | 'NAVIGATIONAL' | 'COMMERCIAL' | 'TRANSACTIONAL'
      KeywordSource: 'BRAINSTORM' | 'GSC' | 'ANALYTICS' | 'COMPETITOR' | 'TOOL' | 'MANUAL'
      ContentStatus: 'NOT_STARTED' | 'PLANNED' | 'IN_PROGRESS' | 'PUBLISHED' | 'NEEDS_UPDATE'
      BacklinkType: 'DOFOLLOW' | 'NOFOLLOW' | 'UGC' | 'SPONSORED'
      BacklinkStatus: 'ACTIVE' | 'LOST' | 'BROKEN'
    }
  }
}