# SEO Tool

A comprehensive SEO analytics and optimization platform built with Next.js. Monitor and improve your website's SEO performance through advanced keyword analysis, technical SEO audits, backlink tracking, and integration with Google services.

## Features

- **Dashboard Overview**: Centralized view of SEO metrics and performance indicators
- **Project Management**: Organize and track multiple websites/projects
- **Keyword Analysis**:
  - Keyword discovery and research
  - Competitor gap analysis
  - Keyword grouping and organization
  - Priority scoring
  - Performance tracking
- **Technical SEO**:
  - Performance analysis
  - Mobile optimization checks
  - Security audit
  - Technical issues scanning
- **Content Analysis**: Evaluate and optimize website content
- **Backlink Analysis**: Track and analyze backlink profile
- **Analytics Integration**: 
  - Google Analytics data integration
  - Google Search Console metrics
- **Authentication**: Secure user authentication system

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI**: React 18 with Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM
- **State Management**: Zustand
- **Data Fetching**: SWR
- **UI Components**: 
  - Radix UI
  - TanStack Table
  - Heroicons
- **Analytics**: Google Analytics Data API
- **Natural Language Processing**: Natural.js
- **HTTP Client**: Axios

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd seo-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in `.env`:
```env
# Database
DATABASE_URL="your-database-url"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# Google APIs
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

## Development

Run the development server with Turbopack:
```bash
npm run dev
```

Other available commands:
```bash
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages and features
├── components/            # Reusable React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── navigation/        # Navigation components
│   ├── projects/         # Project management components
│   └── ui/               # UI components
├── lib/                  # Utility functions and shared logic
├── providers/           # React context providers
├── services/           # Service layer
│   └── seo/            # SEO analysis services
└── types/              # TypeScript type definitions
```

## Authentication Setup

1. Create a Google Cloud Project
2. Enable the necessary APIs:
   - Google Analytics Data API
   - Google Search Console API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs in the Google Cloud Console
5. Copy the client ID and secret to your `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is private and proprietary software.
