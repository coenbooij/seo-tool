# Backlink Management

## URL Handling and Validation

### URL Formatting
- Automatically adds `https://` if protocol is missing
- Normalizes URLs using URL API
- Validates URL structure before submission
- Handles both source and target URLs consistently

### Input Assistance
- Tooltips explain each field's purpose
- Clear validation feedback
- URL format examples in placeholders
- Information about link types and their implications

## Domain Authority Calculation

The domain authority score (0-100) is calculated based on multiple weighted factors:

### Factors and Weights
- **Domain Age** (20 points max)
  - 2 points per year
  - Determined by last-modified header or first discovery
  - Helps identify established domains

- **Existing Backlinks** (30 points max)
  - 0.3 points per existing backlink
  - Based on backlinks found in our database
  - More backlinks indicate higher authority

- **HTTPS Status** (10 points)
  - 10 points if HTTPS is enabled
  - 0 points if not
  - Shows technical competence and security awareness

- **Outbound Link Quality** (20 points max)
  - Logarithmic scale based on number of outbound links
  - Diminishing returns for very high numbers
  - Formula: min(20, log(outboundLinks + 1) * 5)
  - Too many links might indicate a link farm

- **Technical Factors** (20 points max)
  - robots.txt present: 10 points
  - sitemap.xml present: 10 points
  - Indicates proper SEO implementation

## Backlink Types

### DOFOLLOW
- Standard link that passes SEO value
- Default type if not specified
- Most valuable for SEO
- Shows natural link building
- Example: Regular editorial links

### NOFOLLOW
- Has rel="nofollow" attribute
- Doesn't pass SEO value directly
- Still valuable for traffic and brand awareness
- Common in blog comments and forums
- Example: Links in comment sections

### UGC (User Generated Content)
- Links from comments, forums, etc.
- Indicates user-generated content
- Limited SEO value
- Required for user-contributed content
- Example: Forum signature links

### SPONSORED
- Paid or sponsored links
- Must be marked as such for compliance
- No direct SEO value
- Required for FTC compliance
- Example: Affiliate links

## Status Tracking

### Status Types
- **ACTIVE**: Link is currently live and pointing to target URL
- **LOST**: Link was found but no longer points to target URL
- **BROKEN**: Unable to access link URL (404, timeouts, etc.)

### Status Check Process
1. Validates URL accessibility
2. Checks target URL presence
3. Verifies link attributes
4. Updates status history

### Monitoring Features
- Manual status checks per backlink
- Bulk recheck capability
- Automatic status updates (scheduled)
- History tracking for trend analysis

## Best Practices

1. URL Management
   - Always input full URLs when possible
   - Check URL validity before adding
   - Verify target URL accessibility
   - Use proper link type attributes

2. Regular Monitoring
   - Check backlinks weekly
   - Investigate lost links promptly
   - Track domain authority changes
   - Monitor competitor backlinks

3. Link Quality
   - Focus on high authority domains
   - Maintain natural anchor text variety
   - Use appropriate link types
   - Build relationships with link partners

4. Recovery Process
   - Contact site owners for lost links
   - Update broken target URLs
   - Document outreach efforts
   - Track success rates

## User Interface Elements

1. Add/Edit Dialog
   - Tooltips explain each field
   - URL format assistance
   - Link type explanations
   - Validation feedback

2. Status Indicators
   - Color-coded status badges
   - Hover tooltips with details
   - Quick status refresh
   - Historical status view

3. Bulk Actions
   - Recheck all backlinks
   - Filter by status
   - Sort by metrics
   - Export capabilities

4. Metrics Display
   - Domain authority score
   - Status distribution
   - Growth trends
   - Anchor text analysis