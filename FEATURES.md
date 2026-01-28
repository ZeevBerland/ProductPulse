# ProductPulse - Complete Feature Documentation

## Overview

**ProductPulse** is an AI-powered feedback intelligence platform designed for product managers and teams. It continuously monitors public conversations across multiple platforms, analyzes sentiment and themes using Google Gemini AI, and delivers actionable insights through an intuitive dashboard.

**Tagline:** *Track the Voice of the Product — Everywhere.*

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Convex (Real-time Database, Queries/Mutations/Actions, Cron Jobs) |
| **AI** | Google Gemini 3 API (gemini-3-flash-preview) |
| **Charts** | Recharts |
| **Theme** | Light/Dark/System mode support |

---

## Core Features

### 1. Project Management

#### Create Projects
- Set up projects to track specific products, features, or topics
- Add product name and description for AI context
- AI-powered keyword suggestions based on product description
- AI-powered competitor discovery

#### Project Settings
- Edit project name, description, keywords, and competitors
- Configure fetch intervals (Manual, 6h, 12h, 24h)
- Delete projects with full cascade (sources, feed items, insights, alerts)

---

### 2. Source Management

#### Supported Source Types
| Type | Description | Feed URL Format |
|------|-------------|-----------------|
| **Reddit** | Subreddits and search queries | `reddit.com/r/{subreddit}.rss` |
| **Hacker News** | Tech discussions via hnrss.org | `hnrss.org/newest?q={query}` |
| **Stack Exchange** | Q&A sites (Stack Overflow, etc.) | `stackoverflow.com/feeds/tag/{tag}` |
| **Discourse** | Public forum discussions | `{domain}/latest.rss` |
| **Custom RSS** | Any valid RSS/Atom feed | Any valid feed URL |

#### AI Source Suggestions
- Click "Suggest Sources" to get AI-recommended feeds based on your product
- Pre-selects relevant subreddits, HN queries, Stack Exchange tags, and Discourse forums
- Shows relevance scores for Reddit suggestions
- One-click to add multiple sources at once

#### Source Features
- Toggle sources active/inactive
- View last fetch timestamp
- Delete individual sources
- Rate limiting protection (5s delays for Reddit, 1s for others)

---

### 3. Feed Fetching

#### Automatic Fetching
- Configurable intervals: Manual only, Every 6 hours, Every 12 hours, Every 24 hours
- Cron job runs every 30 minutes to check for due fetches
- Per-project fetch intervals respected

#### Manual Fetching
- "Fetch Now" button for immediate fetching
- Progress indicator during fetch
- **Stop Fetching** functionality to cancel mid-fetch
- Warning dialog if fetch already in progress
- Results show: sources fetched, new items found, errors

#### Deduplication
- Items deduplicated by external ID per source
- Prevents duplicate entries from multiple fetches

---

### 4. AI Analysis

#### Gemini-Powered Analysis
- Uses Google Gemini 3 (gemini-3-flash-preview) with low thinking mode
- Analyzes each feed item for:
  - **Relevance Score** (0-1): How relevant to tracked keywords/competitors
  - **Sentiment Score** (-1 to +1): Negative to positive sentiment
  - **Sentiment Label**: Positive, Neutral, or Negative
  - **Entities**: Product names, features, competitors mentioned
  - **Themes**: Topics like pricing, UX, performance, features, support, bugs
  - **Summary**: 1-2 sentence insight for product managers
  - **Actionability**: High, Medium, or Low priority

#### Relevance Filtering
- Items with relevance score < 0.3 are automatically skipped
- Prevents noise from irrelevant content
- Relevance based on keyword and competitor mentions

#### Automatic Processing
- Cron job runs every 15 minutes to analyze unprocessed items
- Batch processing with rate limiting
- Manual "Analyze Now" button available

---

### 5. Insights Dashboard

#### Insights Feed
- Card-based view of all analyzed insights
- Shows: title, summary, sentiment, relevance, themes, source, date
- Color-coded sentiment indicators (green/amber/red)
- Click to view original source

#### Filtering & Search
- **Sentiment Filter**: All, Positive, Neutral, Negative
- **Relevance Filter**: All, High (70%+), Medium (50%+), Low (30%+)
- **Competitor Filter**: Filter by competitor mentions (dynamic based on project)
- **Time Range**: Last 7, 30, or 90 days

#### Charts View
- **Sentiment Trend Chart**: Line chart showing sentiment over time
- **Sentiment Distribution**: Pie chart of positive/neutral/negative breakdown

#### Themes & Entities View
- **Top Themes Card**: Most common themes with counts
- **Top Entities Card**: Most mentioned entities with counts

#### Export
- Export insights to CSV format
- Includes all fields: title, summary, sentiment, themes, entities, URL, dates

---

### 6. Deep Analytics

#### Volume Trend Chart
- Daily insight counts with 7-day moving average
- Area + line combo visualization
- Identifies trends and patterns

#### Competitor Mentions Chart
- Horizontal bar chart of competitor mention counts
- Color-coded by average sentiment (green/amber/red)
- Tracks which competitors users discuss most

#### Theme Trends Chart
- Multi-line chart tracking theme evolution over time
- Growth indicators (week-over-week percentage)
- Emerging themes detection (appeared in last 7 days only)

#### Source Performance Chart
- Horizontal bar chart of insights per source
- Color-coded by source type
- Identifies most valuable sources

#### Actionability Distribution
- Donut/pie chart of high/medium/low priority items
- High-priority themes breakdown
- Helps prioritize product decisions

---

### 7. Alerts System

#### Alert Types
| Type | Trigger |
|------|---------|
| **Sentiment Drop** | Average sentiment falls below threshold |
| **Keyword Mention** | Specific keywords detected in content |
| **Competitor Mention** | Tracked competitors mentioned |
| **High Actionability** | High-priority feedback detected |

#### Alert Delivery
- Slack webhook integration
- Email notifications (configurable)
- Toggle alerts active/inactive

---

### 8. User Settings

#### Appearance
- **Theme Toggle**: Light, Dark, or System preference
- Persisted to localStorage

#### Notifications
- Email alerts toggle
- Browser notifications toggle
- Digest frequency: Real-time, Daily, Weekly, None

#### Display Preferences
- Default insights view: Feed, Charts, or Table
- Insights per page: 10, 20, 50, 100
- Show/hide relevance scores
- Compact mode toggle

#### Data & Privacy
- Export all data
- Clear local data/preferences

---

### 9. UI/UX Features

#### Responsive Layout
- Dual sidebar system: Main navigation + Project sidebar
- Compact project sidebar (192px) for efficient space usage
- Full-width content areas with max-width constraints on forms

#### Real-time Updates
- Convex real-time sync for instant data updates
- No manual refresh needed

#### Loading States
- Skeleton loaders during data fetching
- Progress indicators for long operations

#### Toast Notifications
- Success/error feedback for all actions
- Non-intrusive bottom-right positioning

#### Consistent Design
- shadcn/ui component library
- Consistent spacing and typography
- Dark mode support throughout

---

## Data Flow

```
┌─────────────────┐
│   RSS Sources   │
│ Reddit, HN, SE  │
└────────┬────────┘
         │ Fetch (Cron/Manual)
         ▼
┌─────────────────┐
│   Feed Items    │
│  (Deduplicated) │
└────────┬────────┘
         │ Analyze (Cron/Manual)
         ▼
┌─────────────────┐
│   Gemini AI     │
│  Analysis API   │
└────────┬────────┘
         │ Extract Insights
         ▼
┌─────────────────┐
│    Insights     │
│ Sentiment/Theme │
└────────┬────────┘
         │ Display
         ▼
┌─────────────────┐
│   Dashboard     │
│ Charts/Feed/CSV │
└─────────────────┘
```

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `projects` | Product tracking configurations |
| `sources` | RSS feed sources per project |
| `feedItems` | Raw items fetched from feeds |
| `insights` | AI-analyzed insights |
| `alerts` | Notification rules |

### Key Fields

#### Projects
- `name`, `description`, `keywords[]`, `competitors[]`
- `fetchInterval` (minutes, 0 = manual)
- `fetchStatus` (idle/fetching/stopping)

#### Insights
- `sentimentScore` (-1 to +1), `sentimentLabel`
- `relevanceScore` (0 to 1)
- `entities[]`, `themes[]`, `summary`
- `actionability` (high/medium/low)

---

## Cron Jobs

| Job | Interval | Purpose |
|-----|----------|---------|
| `fetch-feeds` | 30 minutes | Check and fetch due sources |
| `analyze-items` | 15 minutes | Process unanalyzed feed items |

---

## API Endpoints (Convex)

### Queries
- `projects.list`, `projects.listWithStats`, `projects.get`, `projects.getWithStats`
- `sources.listByProject`
- `insights.listByProject`, `insights.getStats`, `insights.getSentimentTrend`
- `insights.getVolumeTrend`, `insights.getCompetitorMentions`, `insights.getThemeTrends`
- `insights.getSourceStats`, `insights.getActionabilityStats`
- `alerts.listByProject`

### Mutations
- `projects.create`, `projects.update`, `projects.remove`
- `projects.setCompetitors`, `projects.updateFetchInterval`, `projects.requestStopFetch`
- `sources.create`, `sources.toggleActive`, `sources.delete`
- `alerts.create`, `alerts.update`, `alerts.delete`, `alerts.toggleActive`

### Actions
- `feeds.fetch.triggerFetchProject`, `feeds.fetch.triggerFetchAll`
- `analysis.gemini.triggerBatchAnalysis`
- `suggestions.suggestProjectSetup`, `suggestions.suggestCompetitors`
- `insights.exportToCsv`

---

## Security & Rate Limiting

- **Reddit**: 5-second delays between requests, exponential backoff on 429
- **Other sources**: 1-second delays between requests
- **Gemini API**: Rate limiting handled, retry logic
- **No scraping**: All data from public RSS/Atom feeds (legal, API-free)

---

## Getting Started

1. Clone repository
2. `npm install`
3. `npx convex dev` (sets up database)
4. Copy `.env.local.example` to `.env.local`
5. `npx convex env set GEMINI_API_KEY your_key_here`
6. `npm run dev`
7. Open http://localhost:3000

---

## Future Enhancements (Not Yet Implemented)

- User authentication (Clerk/Auth0)
- Team collaboration features
- Custom AI prompts per project
- More alert delivery channels (Discord, webhooks)
- Historical trend analysis
- Competitor comparison reports
- Mobile app

---

**ProductPulse gives product teams their ears back.**
Track what your users (and your competitors' users) are saying—without scraping, surveys, or spam.
