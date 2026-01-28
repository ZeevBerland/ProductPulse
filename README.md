# ProductPulse

**Track the Voice of the Product — Everywhere.**

ProductPulse is an AI-powered feedback intelligence platform for product managers. It continuously monitors and analyzes public product conversations from legal, API-free sources—RSS feeds from Reddit, Hacker News, Stack Exchange, Discourse, and more—to extract actionable insights using Google Gemini AI.

## Key Features

- **Multi-Source Monitoring**: Track conversations from Reddit, Hacker News, Stack Exchange, Discourse, and custom RSS feeds
- **AI-Powered Analysis**: Automatic sentiment analysis, relevance scoring, entity extraction, and theme clustering using Google Gemini 3
- **Deep Analytics Dashboard**: Volume trends, competitor mentions, theme evolution, source performance, and actionability distribution
- **Competitor Tracking**: Monitor mentions of competitors and analyze sentiment around them
- **Relevance Filtering**: AI scores content relevance to your tracked keywords (0-100%)
- **Real-Time Dashboard**: View insights, sentiment trends, and statistics with real-time Convex sync
- **Smart Fetch Control**: Configurable intervals (manual/6h/12h/24h) with stop functionality
- **Slack Alerts**: Get notified when important feedback is detected
- **CSV Export**: Export insights data for external analysis
- **Dark Mode**: Full light/dark/system theme support

> 📖 **See [FEATURES.md](./FEATURES.md) for complete feature documentation.**

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (Real-time Database, Queries/Mutations/Actions, Cron Jobs)
- **AI**: Google Gemini 3 API (gemini-3-flash-preview)
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Convex account (free tier available)
- A Google AI Studio API key

### Installation

1. Clone the repository:

```bash
cd product-pulse
```

2. Install dependencies:

```bash
npm install
```

3. Set up Convex:

```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Deploy your schema and functions
- Generate the `NEXT_PUBLIC_CONVEX_URL` for your `.env.local`

4. Configure environment variables:

Copy `.env.local.example` to `.env.local` and fill in your Convex URL:

```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

5. Add your Gemini API key to Convex:

```bash
npx convex env set GEMINI_API_KEY your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Usage

### Creating a Project

1. Go to the Dashboard and click "New Project"
2. Enter a name and description
3. Add keywords you want to track (e.g., your product name, features, competitors)

### Adding Sources

1. Open your project and go to "Sources"
2. Click "Add Source" and select a source type:
   - **Reddit**: Track subreddits or search for keywords
   - **Hacker News**: Monitor for mentions on HN
   - **Stack Exchange**: Follow tags on Stack Overflow or other SE sites
   - **Discourse**: Monitor public Discourse forums
   - **Custom RSS**: Add any RSS/Atom feed URL

### Viewing Insights

- The **Insights** page shows all analyzed feedback with sentiment scores
- Use filters to find specific sentiment types or time ranges
- View charts to understand sentiment trends over time
- Export data to CSV for further analysis

### Setting Up Alerts

1. Go to your project's "Alerts" page
2. Create alerts for:
   - High actionability items (urgent feedback)
   - Sentiment drops below a threshold
   - Keyword or competitor mentions
3. Connect your Slack webhook to receive notifications

## RSS Feed Templates

ProductPulse supports various RSS feed formats:

### Reddit
- Subreddit feed: `https://www.reddit.com/r/{subreddit}.rss`
- Search: `https://www.reddit.com/r/{subreddit}/search.rss?q={keyword}&sort=new`

### Hacker News
- Search: `https://hnrss.org/newest?q={keyword}`
- Front page: `https://hnrss.org/frontpage`

### Stack Exchange
- Tag feed: `https://stackoverflow.com/feeds/tag/{tag}`

### Discourse
- Latest: `https://{domain}/latest.rss`
- Category: `https://{domain}/c/{category}.rss`

## Cron Jobs

ProductPulse automatically runs two scheduled jobs:

1. **Feed Fetching** (every 30 minutes): Checks and fetches sources based on per-project intervals
2. **Analysis** (every 15 minutes): Processes unanalyzed feed items through Gemini AI

## License

MIT

---

**ProductPulse gives product teams their ears back.**
Track what your users (and your competitors' users) are saying—without scraping, surveys, or spam.
