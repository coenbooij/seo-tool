# Google API Integration Guide

## Overview

This guide details the implementation of Google Search Console (GSC) and Google Keyword Planner (GKP) integrations for the SEO tool's keyword research functionality.

## Google Search Console Integration

### Authentication Setup

1. Create a project in Google Cloud Console
2. Enable Search Console API
3. Create OAuth 2.0 credentials
4. Configure OAuth consent screen
5. Add required scopes:
   - `https://www.googleapis.com/auth/webmasters.readonly`
   - `https://www.googleapis.com/auth/webmasters`

### Environment Variables

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### Data Retrieval Flow

1. **Site Verification**
   - Verify domain ownership through GSC
   - Store verification token in Project model
   - Implement verification status check

2. **Performance Data**
   ```typescript
   interface SearchAnalyticsQuery {
     startDate: string;
     endDate: string;
     dimensions: string[];
     rowLimit?: number;
     filters?: Array<{
       dimension: string;
       operator: string;
       expression: string;
     }>;
   }
   ```

3. **Metrics to Track**
   - Position (ranking)
   - Clicks
   - Impressions
   - CTR
   - Page URL
   - Country
   - Device

## Google Keyword Planner Integration

### Authentication Setup

1. Create Google Ads Developer token
2. Generate refresh token for oauth2 authentication
3. Configure API access in Google Ads account

### Environment Variables

```env
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token
```

### Implementation Details

1. **Keyword Ideas Request**
   ```typescript
   interface KeywordIdeasRequest {
     keywords: string[];
     language: string;
     location: string;
     pageUrl?: string;
   }
   ```

2. **Metrics to Retrieve**
   - Average monthly searches
   - Competition level
   - Competition index (1-100)
   - Top of page bid ranges
   - Keyword variations

## Rate Limiting & Caching

### GSC Rate Limits
- 2000 queries per day per project
- 200 queries per minute per user
- Implement exponential backoff

### GKP Rate Limits
- Varies by account spend
- Default: 100 operations per day
- Implement request pooling

### Caching Strategy

1. **Redis Cache Implementation**
   ```typescript
   interface CacheConfig {
     ttl: number;
     prefix: string;
     strategy: 'write-through' | 'write-behind';
   }
   ```

2. **Cache Keys**
   - GSC data: `gsc:{siteUrl}:{date}:{dimensions}`
   - GKP data: `gkp:{keyword}:{location}:{language}`

3. **Invalidation Rules**
   - GSC data: 24 hours
   - GKP data: 7 days
   - Force refresh on user request

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**
   - Token expiration
   - Invalid credentials
   - Insufficient permissions

2. **Rate Limit Errors**
   - Implement retry mechanism
   - Queue requests when approaching limits

3. **API Response Errors**
   - Invalid data format
   - Missing required fields
   - Network timeouts

### Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  source: 'GSC' | 'GKP';
  details?: unknown;
  retryable: boolean;
}
```

## Implementation Classes

### Base Service Class
```typescript
abstract class GoogleApiService {
  protected abstract getAccessToken(): Promise<string>;
  protected abstract handleRateLimit(error: ApiError): Promise<void>;
  protected abstract validateResponse(response: unknown): boolean;
}
```

### GSC Service
```typescript
class SearchConsoleService extends GoogleApiService {
  public async getSearchAnalytics(query: SearchAnalyticsQuery): Promise<SearchAnalyticsData>;
  public async getSiteVerification(domain: string): Promise<VerificationStatus>;
  public async refreshSiteData(siteUrl: string): Promise<void>;
}
```

### GKP Service
```typescript
class KeywordPlannerService extends GoogleApiService {
  public async getKeywordIdeas(request: KeywordIdeasRequest): Promise<KeywordIdea[]>;
  public async getKeywordMetrics(keywords: string[]): Promise<KeywordMetrics[]>;
  public async estimateTraffic(keywords: string[]): Promise<TrafficEstimate[]>;
}
```

## Data Integration Flow

1. User initiates keyword research
2. System checks cache for existing data
3. If cache miss:
   - Fetch GSC performance data
   - Get keyword ideas from GKP
   - Combine and analyze data
   - Update database
   - Cache results
4. Return consolidated data to user

## Monitoring & Logging

### Metrics to Track
- API call success rate
- Response times
- Cache hit ratio
- Rate limit status
- Error frequency

### Log Events
- Authentication attempts
- API calls
- Cache operations
- Rate limit hits
- Error occurrences

## Security Considerations

1. **Token Storage**
   - Encrypt refresh tokens
   - Use secure env variables
   - Implement token rotation

2. **Request Validation**
   - Validate all input parameters
   - Sanitize query strings
   - Check authorization

3. **Data Access**
   - Implement user-level permissions
   - Log all data access attempts
   - Regular security audits