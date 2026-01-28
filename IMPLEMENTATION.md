# ProductPulse Implementation Summary

## Overview

ProductPulse is an AI-powered feedback intelligence tool for product managers. It monitors public product conversations from RSS feeds (Reddit, Hacker News, Stack Exchange, Discourse) and analyzes them using Google Gemini to extract actionable insights.

**Tech Stack:**
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (Database, Queries/Mutations/Actions, Cron Jobs)
- **AI**: Google Gemini API (gemini-1.5-flash)
- **Charts**: Recharts

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Dashboard │ │ Projects │ │ Sources  │ │ Insights │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
│       └────────────┴────────────┴────────────┘                  │
│                           │                                     │
│                    Real-time Sync                               │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                     Convex Backend                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Queries  │ │Mutations │ │ Actions  │ │  Crons   │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
│       └────────────┴────────────┼────────────┘                  │
│                           │     │                               │
│                    ┌──────┴─────┴──────┐                        │
│                    │  Convex Database  │                        │
│                    └───────────────────┘                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
      ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
      │ RSS Feeds │   │  Gemini   │   │   Slack   │
      │  (fetch)  │   │   (AI)    │   │ (alerts)  │
      └───────────┘   └───────────┘   └───────────┘
```

---

## Database Schema

### Tables

#### 1. `projects`
Stores product/project configurations that users want to track.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated Convex ID |
| `name` | string | Project name |
| `description` | string? | Optional description |
| `keywords` | string[] | Keywords to track |
| `createdAt` | number | Creation timestamp |

#### 2. `sources`
RSS feed sources configured for each project.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated Convex ID |
| `projectId` | Id<projects> | Parent project reference |
| `type` | enum | "reddit" \| "hackernews" \| "stackexchange" \| "discourse" \| "rss" |
| `name` | string | Display name |
| `feedUrl` | string | RSS feed URL |
| `active` | boolean | Whether source is actively fetched |
| `lastFetched` | number? | Last fetch timestamp |
| `config` | any? | Source-specific configuration |

**Indexes:** `by_project`, `by_active`

#### 3. `feedItems`
Individual items fetched from RSS feeds.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated Convex ID |
| `sourceId` | Id<sources> | Parent source reference |
| `externalId` | string | Unique ID from the RSS feed |
| `title` | string | Item title |
| `content` | string | Item content/description |
| `url` | string | Link to original |
| `author` | string? | Author name |
| `publishedAt` | number | Publication timestamp |
| `fetchedAt` | number | When we fetched it |
| `analyzed` | boolean | Whether AI has processed it |

**Indexes:** `by_source`, `by_analyzed`, `by_external_id`

#### 4. `insights`
AI-generated analysis results for feed items.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated Convex ID |
| `feedItemId` | Id<feedItems> | Source feed item |
| `projectId` | Id<projects> | Project reference |
| `sourceId` | Id<sources> | Source reference |
| `sentimentScore` | number | -1 to 1 sentiment score |
| `sentimentLabel` | enum | "positive" \| "negative" \| "neutral" |
| `entities` | string[] | Mentioned products/features |
| `themes` | string[] | Categorized themes |
| `summary` | string | PM-ready summary |
| `actionability` | enum | "high" \| "medium" \| "low" |
| `analyzedAt` | number | Analysis timestamp |
| `feedItemTitle` | string | Denormalized title |
| `feedItemUrl` | string | Denormalized URL |
| `feedItemPublishedAt` | number | Denormalized date |

**Indexes:** `by_project`, `by_project_date`, `by_feedItem`, `by_sentiment`

#### 5. `alerts`
Notification configurations.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Auto-generated Convex ID |
| `projectId` | Id<projects> | Project reference |
| `name` | string | Alert name |
| `type` | enum | Alert trigger type |
| `conditions` | object | Threshold/keywords |
| `slackWebhook` | string? | Slack webhook URL |
| `emailTo` | string? | Email recipient |
| `active` | boolean | Whether alert is active |

**Indexes:** `by_project`

---

## Convex Functions

### Queries (Real-time data fetching)

| Function | File | Description |
|----------|------|-------------|
| `projects.list` | `convex/projects.ts` | List all projects |
| `projects.get` | `convex/projects.ts` | Get project by ID |
| `projects.getWithStats` | `convex/projects.ts` | Get project with computed stats |
| `sources.listByProject` | `convex/sources.ts` | List sources for a project |
| `sources.get` | `convex/sources.ts` | Get single source |
| `sources.getWithStats` | `convex/sources.ts` | Get source with item counts |
| `sources.listActive` | `convex/sources.ts` | List all active sources |
| `feedItems.listBySource` | `convex/feedItems.ts` | List items for a source |
| `feedItems.listUnanalyzed` | `convex/feedItems.ts` | List unanalyzed items |
| `insights.listByProject` | `convex/insights.ts` | List insights with filters |
| `insights.getStats` | `convex/insights.ts` | Get sentiment statistics |
| `insights.getSentimentTrend` | `convex/insights.ts` | Get daily trend data |
| `insights.getHighActionability` | `convex/insights.ts` | Get high-priority insights |
| `alerts.listByProject` | `convex/alerts.ts` | List alerts for project |

### Mutations (Data modifications)

| Function | File | Description |
|----------|------|-------------|
| `projects.create` | `convex/projects.ts` | Create new project |
| `projects.update` | `convex/projects.ts` | Update project |
| `projects.remove` | `convex/projects.ts` | Delete project and all data |
| `sources.create` | `convex/sources.ts` | Create new source |
| `sources.update` | `convex/sources.ts` | Update source |
| `sources.toggle` | `convex/sources.ts` | Toggle active status |
| `sources.remove` | `convex/sources.ts` | Delete source and items |
| `feedItems.upsert` | `convex/feedItems.ts` | Insert/update with dedup |
| `feedItems.markAnalyzed` | `convex/feedItems.ts` | Mark as analyzed |
| `insights.create` | `convex/insights.ts` | Create insight |
| `alerts.create` | `convex/alerts.ts` | Create alert |
| `alerts.update` | `convex/alerts.ts` | Update alert |
| `alerts.toggle` | `convex/alerts.ts` | Toggle alert |
| `alerts.remove` | `convex/alerts.ts` | Delete alert |

### Actions (External API calls)

| Function | File | Description |
|----------|------|-------------|
| `feeds.fetch.fetchSource` | `convex/feeds/fetch.ts` | Fetch single RSS source |
| `feeds.fetch.fetchAllSources` | `convex/feeds/fetch.ts` | Fetch all active sources |
| `feeds.fetch.triggerFetch` | `convex/feeds/fetch.ts` | Public: trigger single fetch |
| `feeds.fetch.triggerFetchAll` | `convex/feeds/fetch.ts` | Public: trigger all fetches |
| `analysis.gemini.analyzeItem` | `convex/analysis/gemini.ts` | Analyze single item |
| `analysis.gemini.analyzeUnprocessed` | `convex/analysis/gemini.ts` | Batch analyze items |
| `analysis.gemini.triggerAnalysis` | `convex/analysis/gemini.ts` | Public: trigger analysis |
| `analysis.gemini.triggerBatchAnalysis` | `convex/analysis/gemini.ts` | Public: trigger batch |
| `alerts.slack.sendSlackMessage` | `convex/alerts/slack.ts` | Send Slack message |
| `alerts.slack.sendInsightAlert` | `convex/alerts/slack.ts` | Send insight notification |
| `alerts.slack.testSlackWebhook` | `convex/alerts/slack.ts` | Test webhook |

### Cron Jobs

| Job | Interval | Function | Description |
|-----|----------|----------|-------------|
| `fetch-feeds` | 15 minutes | `fetchAllSources` | Fetch new RSS items |
| `analyze-items` | 5 minutes | `analyzeUnprocessed` | Process unanalyzed items |

---

## Frontend Pages

### Landing Page (`/`)
- Hero section with value proposition
- Features overview (3 cards)
- Supported sources display
- CTA to dashboard

### Dashboard (`/dashboard`)
- Overview stats cards
- Projects quick list
- Navigation to all sections

### Projects List (`/dashboard/projects`)
- Grid of project cards
- Create new project button
- Edit/delete actions
- Keywords display

### New Project (`/dashboard/projects/new`)
- Project form with name, description
- Keyword input with add/remove
- Validation

### Project Overview (`/dashboard/projects/[id]`)
- Project info and keywords
- Stats cards (sources, insights, sentiment)
- Sources quick view
- Recent insights preview

### Sources Management (`/dashboard/projects/[id]/sources`)
- Source cards with status
- Add source dialog with templates:
  - Reddit (subreddit, search)
  - Hacker News (search, frontpage, show, ask)
  - Stack Exchange (tag feeds)
  - Discourse (latest, category, tag)
  - Custom RSS
- Toggle active/inactive
- Delete confirmation

### Insights (`/dashboard/projects/[id]/insights`)
- Stats cards row
- Tabs: Feed | Charts | Themes
- **Feed tab**: Scrollable insights list with:
  - Sentiment badges
  - Actionability indicators
  - Theme tags
  - Summary
  - Link to source
- **Charts tab**:
  - Sentiment trend line chart
  - Sentiment distribution bar chart
- **Themes tab**:
  - Top themes list
  - Top entities list
- Filters: sentiment, time range
- Manual fetch/analyze buttons
- CSV export

### Alerts (`/dashboard/projects/[id]/alerts`)
- Alert cards with type icons
- Toggle active status
- Create alert dialog:
  - Alert type selection
  - Conditions (threshold/keywords)
  - Slack webhook with test button
- Delete confirmation

### Settings (`/dashboard/settings`)
- Service status indicators
- Setup instructions
- About information

---

## UI Components

### shadcn/ui Components
Located in `components/ui/`:
- `button.tsx` - Button variants
- `input.tsx` - Text input
- `label.tsx` - Form labels
- `card.tsx` - Card container
- `badge.tsx` - Status badges
- `select.tsx` - Dropdown select
- `tabs.tsx` - Tab navigation
- `dialog.tsx` - Modal dialogs
- `textarea.tsx` - Multi-line input
- `separator.tsx` - Visual separator
- `avatar.tsx` - User avatar
- `dropdown-menu.tsx` - Context menus
- `scroll-area.tsx` - Scrollable container
- `switch.tsx` - Toggle switch
- `skeleton.tsx` - Loading skeleton
- `toast.tsx` - Toast notifications
- `toaster.tsx` - Toast container

### Dashboard Components
Located in `components/dashboard/`:
- `sidebar.tsx` - Navigation sidebar
- `header.tsx` - Page header with search
- `sentiment-chart.tsx` - Recharts visualizations
- `insights-feed.tsx` - Insights list component
- `stats-cards.tsx` - Statistics cards
- `source-card.tsx` - Source display card
- `export-button.tsx` - CSV export

### Form Components
Located in `components/forms/`:
- `project-form.tsx` - Project create/edit
- `source-form.tsx` - Source configuration
- `alert-form.tsx` - Alert configuration

### Provider Components
Located in `components/providers/`:
- `convex-provider.tsx` - Convex React provider

---

## RSS Feed Parser

Custom XML parser in `convex/feeds/parser.ts`:

### Supported Formats
- RSS 2.0
- Atom 1.0

### Features
- HTML entity decoding
- CDATA section handling
- HTML tag stripping
- Date parsing
- Deduplication via external ID

### Feed Item Structure
```typescript
interface FeedItem {
  id: string;      // Unique identifier
  title: string;   // Cleaned title
  content: string; // Stripped HTML content
  link: string;    // Original URL
  author?: string; // Author name
  pubDate: Date;   // Publication date
}
```

---

## AI Analysis Pipeline

### Gemini Integration
File: `convex/analysis/gemini.ts`

### Prompt Template
```
Analyze this product feedback from an RSS feed:

Title: {title}
Content: {content (first 2000 chars)}

Provide a JSON response with:
- sentiment: { score: -1 to 1, label: positive|negative|neutral }
- entities: [products, features, competitors]
- themes: [pricing, ux, performance, features, support, bugs, etc.]
- summary: 1-2 sentence PM insight
- actionability: high|medium|low
```

### Processing Flow
1. Cron triggers `analyzeUnprocessed` every 5 minutes
2. Fetches up to 10 unanalyzed items
3. For each item:
   - Calls Gemini API
   - Parses JSON response
   - Creates insight record
   - Marks item as analyzed
4. 500ms delay between items to avoid rate limits

---

## Slack Integration

File: `convex/alerts/slack.ts`

### Message Format
- Header block with alert name
- Project and alert type info
- Feed item title
- Sentiment and actionability fields
- Summary section
- Themes and entities
- "View Source" button

### Alert Types
| Type | Trigger |
|------|---------|
| `high_actionability` | Insight marked as high priority |
| `sentiment_drop` | Score below threshold |
| `keyword_mention` | Specific keywords detected |
| `competitor_mention` | Competitor names in entities |

---

## CSV Export

File: `lib/export.ts`

### Exported Fields
- Title
- URL
- Published At
- Analyzed At
- Sentiment Score
- Sentiment Label
- Actionability
- Summary
- Themes (semicolon-separated)
- Entities (semicolon-separated)

### Features
- Proper CSV escaping
- Download via blob URL
- Timestamped filename

---

## File Structure

```
product-pulse/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── sources/page.tsx
│   │   │       ├── insights/page.tsx
│   │   │       ├── alerts/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── settings/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── sentiment-chart.tsx
│   │   ├── insights-feed.tsx
│   │   ├── stats-cards.tsx
│   │   ├── source-card.tsx
│   │   └── export-button.tsx
│   ├── forms/
│   │   ├── project-form.tsx
│   │   ├── source-form.tsx
│   │   └── alert-form.tsx
│   ├── providers/
│   │   └── convex-provider.tsx
│   └── ui/
│       └── [16 shadcn components]
├── convex/
│   ├── schema.ts
│   ├── projects.ts
│   ├── sources.ts
│   ├── feedItems.ts
│   ├── insights.ts
│   ├── alerts.ts
│   ├── crons.ts
│   ├── feeds/
│   │   ├── parser.ts
│   │   ├── fetch.ts
│   │   ├── queries.ts
│   │   └── mutations.ts
│   ├── analysis/
│   │   └── gemini.ts
│   └── alerts/
│       ├── slack.ts
│       └── queries.ts
├── hooks/
│   └── use-toast.ts
├── lib/
│   ├── utils.ts
│   └── export.ts
├── .env.local.example
├── .gitignore
├── components.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Environment Variables

```env
# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Gemini (add to Convex via `npx convex env set`)
GEMINI_API_KEY=your-gemini-api-key
```

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start Convex backend**
   ```bash
   npx convex dev
   ```

3. **Add Gemini API key**
   ```bash
   npx convex env set GEMINI_API_KEY your_key_here
   ```

4. **Start Next.js development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   Navigate to http://localhost:3000

---

## AI-Powered Project Setup (NEW)

### Overview
The project creation form now includes AI-powered automation to help users set up projects quickly and effectively.

### Features

#### 1. AI Suggestions
When creating a project, users can click "Generate AI Suggestions" after entering a product description. Gemini analyzes the description and suggests:
- **Keywords** (10-15): Product name variations, features, use cases, pain points
- **Competitors** (3-6): Direct competitors users might compare against
- **Subreddits** (5-10): Relevant communities with relevance scores
- **Stack Exchange tags**: Relevant SO/SE tags
- **Hacker News queries**: Search terms for HN discussions
- **Discourse forums**: Known public forums in the space

#### 2. Industry Templates
Pre-configured templates for common product types:
- SaaS Tool
- Developer Tool / API
- Mobile App
- AI/ML Product
- Productivity App
- E-commerce
- Fintech
- EdTech

Each template includes suggested keywords, subreddits, and HN queries.

#### 3. One-Click Setup
Users can select suggestions and click "Create with X Sources" to:
- Create the project with all selected keywords
- Auto-create configured RSS sources
- Start monitoring immediately

### Files
- `convex/ai/suggest.ts` - Gemini-powered suggestions action
- `lib/source-templates.ts` - URL builders and industry templates
- `components/forms/ai-suggestions-panel.tsx` - Suggestions UI with checkboxes
- `components/forms/source-recommendations.tsx` - Source preview component
- `convex/projects.ts` - Added `createWithSources` mutation

---

## What's NOT Implemented (Future Work)

- [ ] User authentication (Clerk/Auth0 integration)
- [ ] Email digest notifications
- [ ] CSV import for reviews (G2, App Store)
- [ ] Competitor comparison views
- [ ] Team collaboration features
- [ ] API rate limiting dashboard
- [ ] Historical data retention policies
- [ ] Mobile responsive improvements
- [ ] Dark mode toggle
- [ ] Webhook event logging

---

## Dependencies

### Production
- `next` - React framework
- `react` / `react-dom` - UI library
- `convex` - Backend-as-a-service
- `recharts` - Charting library
- `date-fns` - Date utilities
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `clsx` / `tailwind-merge` - Class utilities
- `@radix-ui/*` - Headless UI primitives

### Development
- `typescript` - Type safety
- `tailwindcss` - CSS framework
- `postcss` / `autoprefixer` - CSS processing
- `eslint` - Linting

---

*Built with Next.js 14, Convex, and Google Gemini*
