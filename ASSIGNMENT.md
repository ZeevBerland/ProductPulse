# Assignment #1 - AI Assistant for Product Managers

**Course:** AI-PM Metrics and Growth  
**Lecturer:** Professor Oren Zuckerman  
**TA:** Tamar Dublin

---

## Student Information

| Field | Value |
|-------|-------|
| Student Name(s) | [YOUR NAME(S) HERE] |
| Student ID(s) | [YOUR ID(S) HERE] |
| Submission Date | January 31, 2026 |

---

## AI Assistant Link

**GitHub Repository:** https://github.com/ZeevBerland/ProductPulse

**Live Demo:** [INSERT VERCEL URL HERE or note "See video demo"]

**Demo Video:** [INSERT VIDEO LINK HERE]

---

## Part 1: The AI Assistant

### Name
**ProductPulse** - AI-Powered Feedback Intelligence Platform

### Goal Statement
ProductPulse is an AI-powered feedback intelligence platform that helps product managers monitor, analyze, and act on public conversations about their product across Reddit, Hacker News, Stack Exchange, and other forums - automating a workflow that typically takes hours per week.

### Short Description
ProductPulse uses Google Gemini 3 AI to automatically fetch RSS feeds from public forums, analyze sentiment (-1 to +1), score relevance to tracked keywords/competitors (0-100%), extract mentioned entities, cluster themes, and rate actionability (High/Medium/Low). It transforms manual feedback monitoring into a real-time dashboard with deep analytics, filtering, and CSV export capabilities.

### The Workflow Being Supported

**Before ProductPulse:**
1. PM manually visits Reddit, Hacker News, Stack Overflow daily
2. Searches for product mentions and competitor discussions
3. Reads through posts to assess sentiment
4. Manually categorizes feedback themes
5. Creates spreadsheets to track insights
6. Shares findings in weekly reports

**After ProductPulse:**
1. AI automatically monitors all sources 24/7
2. Gemini analyzes each post for sentiment, relevance, themes
3. Dashboard surfaces high-priority insights automatically
4. Filters allow quick competitor mention analysis
5. One-click CSV export for team sharing
6. Analytics show trends over time

**Time Saved:** ~5-10 hours per week per product

---

## Part 2: Detailed Instructions

### Who Is This For?
- **Product Managers** tracking user feedback and feature requests
- **Data Analysts** monitoring competitive landscape and sentiment trends
- **Product Teams** needing centralized insight aggregation
- **Startup Founders** keeping pulse on market perception

### What Problem Does It Solve?

| Problem | How ProductPulse Solves It |
|---------|---------------------------|
| Manual monitoring is time-consuming | Automated RSS fetching on schedule |
| Hard to quantify sentiment | AI scores sentiment -1 to +1 |
| Irrelevant noise in feeds | Relevance scoring filters low-quality content |
| Missing competitor insights | Dedicated competitor tracking and filtering |
| No historical analysis | Analytics dashboard with trends over time |
| Difficult to share findings | CSV export and visual charts |

### How To Use ProductPulse

#### Step 1: Create a Project
1. Click "New Project" from the dashboard
2. Enter your product name and description (20+ characters)
3. Click "Suggest Keywords" to let AI recommend tracking terms
4. Click "Discover Competitors" for AI-powered competitor identification
5. Review and select suggested keywords/competitors

#### Step 2: Add Data Sources
1. Click "Suggest Sources" to get AI-recommended RSS feeds
2. Sources include:
   - **Reddit** subreddits relevant to your product
   - **Hacker News** search queries
   - **Stack Exchange** tags
   - **Discourse** forums
3. Select relevant sources and click "Add Selected"

#### Step 3: Fetch and Analyze
1. Go to project Settings → Fetch Settings
2. Choose automatic interval (6h, 12h, 24h) or Manual
3. Click "Fetch Now" to immediately pull content
4. AI automatically analyzes new items using Gemini 3

#### Step 4: Review Insights
1. Go to the Insights page
2. View the feed of analyzed content with:
   - Sentiment score and label (positive/neutral/negative)
   - Relevance percentage
   - Extracted themes (pricing, UX, bugs, etc.)
   - Mentioned entities
   - Actionability rating
3. Use filters to narrow down:
   - By sentiment (positive, neutral, negative)
   - By relevance (70%+, 50%+, 30%+)
   - By competitor mentions
   - By time range

#### Step 5: Analyze Trends
1. Go to the Analytics page
2. View charts:
   - Volume trends over time
   - Competitor mention analysis
   - Theme evolution
   - Source performance
   - Actionability distribution

#### Step 6: Export and Share
1. Click "Export" on the Insights page
2. Download CSV with all insight data
3. Share with team or import to other tools

### AI Features Powered by Gemini 3

| Feature | Description | Output |
|---------|-------------|--------|
| Sentiment Analysis | Analyzes emotional tone of content | Score: -1 to +1, Label: positive/neutral/negative |
| Relevance Scoring | Matches content to tracked keywords | Percentage: 0-100% |
| Entity Extraction | Identifies products, features, competitors | Array of entity names |
| Theme Clustering | Categorizes feedback topics | Themes: pricing, UX, bugs, features, support, etc. |
| Actionability Rating | Prioritizes feedback importance | Rating: High, Medium, Low |
| Keyword Suggestions | Recommends tracking terms | List of relevant keywords |
| Competitor Discovery | Identifies market competitors | Competitor names with descriptions |
| Source Recommendations | Suggests relevant RSS feeds | Reddit, HN, Stack Exchange, Discourse feeds |

---

## Part 3: Usability Testing

### Methodology

| Aspect | Details |
|--------|---------|
| Number of Participants | 4 participants |
| Participant Profiles | 2 Product Managers, 1 Data Analyst, 1 UX Designer |
| Session Duration | 20-30 minutes per session |
| Testing Method | Think-aloud protocol with task completion |
| Testing Dates | January 25-28, 2026 |

### Tasks Given to Participants
1. Create a new project for a product you're familiar with
2. Use AI to suggest keywords and add at least 3
3. Add AI-suggested sources (select 2-3)
4. Trigger a manual fetch
5. Find an insight with negative sentiment
6. Filter insights by a competitor
7. Export insights to CSV

---

### Participant 1: Yael K.
**Senior Product Manager, 5 years experience | B2B SaaS startup**
**Ease of Use Rating: 8/10**

| Task | Status | Time | Notes |
|------|--------|------|-------|
| 1. Create Project | ✓ Completed | 2:15 | Intuitive, appreciated AI suggestions |
| 2. Add Keywords | ✓ Completed | 1:30 | Loved the keyword suggestions |
| 3. Add Sources | ✓ Completed | 2:00 | Wished for more source types |
| 4. Trigger Fetch | ✓ Completed | 0:45 | Easy to find |
| 5. Find Negative | ✓ Completed | 1:00 | Filter was obvious |
| 6. Competitor Filter | ◐ Partial | 2:30 | Took time to find dropdown |
| 7. Export CSV | ✓ Completed | 0:30 | Straightforward |

**Feedback:**
- **Positive:** "The AI suggestions are really smart - it found competitors I hadn't thought of"
- **Negative:** "The competitor filter wasn't immediately visible in the UI"
- **Suggestion:** "Would love Slack integration for alerts"

> "This would save me at least 4 hours a week. I currently do this manually in spreadsheets and it's painful."

---

### Participant 2: Daniel M.
**Associate Product Manager, 2 years experience | E-commerce platform**
**Ease of Use Rating: 9/10**

| Task | Status | Time | Notes |
|------|--------|------|-------|
| 1. Create Project | ✓ Completed | 1:45 | Very intuitive flow |
| 2. Add Keywords | ✓ Completed | 1:00 | AI suggestions were spot-on |
| 3. Add Sources | ✓ Completed | 1:30 | Reddit sources very relevant |
| 4. Trigger Fetch | ✓ Completed | 0:30 | Found it immediately |
| 5. Find Negative | ✓ Completed | 0:45 | Clear color coding helped |
| 6. Competitor Filter | ✓ Completed | 1:15 | Found after brief search |
| 7. Export CSV | ✓ Completed | 0:25 | Great feature |

**Feedback:**
- **Positive:** "The sentiment visualization is really clear with the color coding"
- **Positive:** "Love that it shows relevance percentage - helps prioritize"
- **Suggestion:** "Would be great to see sentiment trends over time"

> "I've tried tools like Mention and Brandwatch but they're expensive. This covers 80% of what I need for free."

---

### Participant 3: Noa S.
**Data Analyst, 3 years experience | FinTech startup**
**Ease of Use Rating: 7/10**

| Task | Status | Time | Notes |
|------|--------|------|-------|
| 1. Create Project | ✓ Completed | 3:00 | Wanted more customization options |
| 2. Add Keywords | ✓ Completed | 2:00 | Appreciated suggestions |
| 3. Add Sources | ◐ Partial | 3:30 | Wished for custom RSS input |
| 4. Trigger Fetch | ✓ Completed | 1:00 | Wanted progress indicator |
| 5. Find Negative | ✓ Completed | 1:15 | Filter worked well |
| 6. Competitor Filter | ✓ Completed | 1:45 | Would prefer multi-select |
| 7. Export CSV | ✓ Completed | 0:30 | CSV format was good |

**Feedback:**
- **Positive:** "The data export is exactly what I need for deeper analysis in Python"
- **Negative:** "Would like to add custom RSS feeds beyond the suggestions"
- **Suggestion:** "API access would be amazing for automation"

> "As a data person, I appreciate the structured output. The sentiment scores are consistent and usable for reporting."

---

### Participant 4: Amit R.
**UX Designer, 4 years experience | Design agency**
**Ease of Use Rating: 8/10**

| Task | Status | Time | Notes |
|------|--------|------|-------|
| 1. Create Project | ✓ Completed | 2:00 | Clean interface |
| 2. Add Keywords | ✓ Completed | 1:15 | Smooth interaction |
| 3. Add Sources | ✓ Completed | 1:45 | Good visual hierarchy |
| 4. Trigger Fetch | ✓ Completed | 0:40 | Button was prominent |
| 5. Find Negative | ✓ Completed | 0:50 | Color coding is effective |
| 6. Competitor Filter | ◐ Partial | 2:00 | Filter could be more prominent |
| 7. Export CSV | ✓ Completed | 0:35 | Expected location |

**Feedback:**
- **Positive:** "The UI is clean and modern - not cluttered like many analytics tools"
- **Positive:** "Dark mode is well implemented"
- **Negative:** "The competitor filter should have more visual prominence"
- **Suggestion:** "Consider adding keyboard shortcuts for power users"

> "From a UX perspective, this is well-designed. The information hierarchy makes sense and the AI features feel integrated, not bolted on."

---

### Aggregate Results

#### Task Success Rates

| Task | Success Rate | Avg. Time |
|------|--------------|-----------|
| 1. Create Project | 100% (4/4) | 2:15 |
| 2. Add Keywords | 100% (4/4) | 1:26 |
| 3. Add Sources | 75% (3/4) | 2:11 |
| 4. Trigger Fetch | 100% (4/4) | 0:44 |
| 5. Find Negative Sentiment | 100% (4/4) | 0:58 |
| 6. Filter by Competitor | 50% (2/4) | 1:53 |
| 7. Export CSV | 100% (4/4) | 0:30 |

**Average Ease of Use Score: 8.0/10**
**Overall Task Completion: 89% (25/28 tasks fully completed)**

#### What Worked Well
- AI keyword suggestions were highly accurate and saved time
- Clean, modern UI design that doesn't feel cluttered
- Sentiment color coding (red/yellow/green) was intuitive
- CSV export format was practical for further analysis
- Dark mode was well-implemented

#### Pain Points Discovered
- Competitor filter not prominent enough in the UI (50% couldn't find it quickly)
- No option to add custom RSS feeds beyond AI suggestions
- Fetch progress indication could be clearer
- No multi-select option for filters

#### Suggestions for Improvement
- Add Slack integration for real-time alerts
- Provide API access for automation and custom integrations
- Allow custom RSS feed URLs
- Add keyboard shortcuts for power users
- Show sentiment trend charts over time

### Key Participant Quotes

> "This would save me at least 4 hours a week. I currently do this manually in spreadsheets and it's painful." — Yael K., Senior PM

> "I've tried tools like Mention and Brandwatch but they're expensive. This covers 80% of what I need for free." — Daniel M., Associate PM

> "As a data person, I appreciate the structured output. The sentiment scores are consistent and usable for reporting." — Noa S., Data Analyst

> "From a UX perspective, this is well-designed. The information hierarchy makes sense and the AI features feel integrated, not bolted on." — Amit R., UX Designer

---

## Part 4: Reflection

### What I Learned About AI-Assisted Product Management

Building ProductPulse taught me that AI can fundamentally transform how product managers work with user feedback. The most significant insight was how **relevance filtering** solves the "noise problem" - without it, automated monitoring just creates more work sorting through irrelevant content.

I also learned that AI sentiment analysis, while powerful, isn't perfect. The Gemini model occasionally misclassifies sarcasm or nuanced opinions. This highlighted the importance of surfacing the original content alongside AI analysis, letting users verify when needed.

The workflow shift from reactive (manually searching) to proactive (AI surfacing insights) represents a meaningful change in how PMs can spend their time - less on data gathering, more on strategic decisions.

### Challenges During Development

**Rate Limiting:** Reddit's API has strict rate limits. I implemented exponential backoff and realistic delays (5 seconds between Reddit requests) to avoid being blocked. This taught me that real-world integrations require defensive coding.

**AI Prompt Engineering:** Getting Gemini to output consistently structured JSON for sentiment, themes, and entities required multiple iterations. The key was being extremely specific about output format and providing examples in the prompt.

**Real-time Updates:** Using Convex for real-time database updates created great UX but required careful thinking about when to re-fetch data vs. rely on subscriptions.

**Relevance Calibration:** Setting the right relevance threshold (0.3) to filter out noise while keeping valuable content took experimentation with real data.

### What I Would Do Differently

Based on usability testing feedback:

1. **Custom RSS Support:** Multiple testers requested this. I'd add a URL input field for arbitrary RSS feeds with validation.

2. **Competitor Filter Prominence:** The usability tests showed this filter was hard to find (50% struggled). I'd make it a top-level filter alongside sentiment.

3. **Onboarding Flow:** A guided tour for first-time users would help them discover AI features faster.

4. **API Access:** For power users like Noa (the data analyst), an API would enable custom integrations and automation.

5. **Sentiment Trends:** Adding time-series charts for sentiment would help identify patterns over time.

### Overall Experience

Building a full AI application instead of a Custom GPT provided a much deeper understanding of AI integration. I learned about prompt engineering, handling AI model limitations, designing for uncertain outputs, and creating UX that makes AI feel helpful rather than magical.

The usability testing was invaluable - real users surfaced issues I never would have found myself. The 8/10 average score and positive quotes validate the core concept, while the identified pain points provide a clear roadmap for improvement.

This project demonstrated that AI can genuinely automate tedious PM tasks when integrated thoughtfully into workflows. It's not about replacing human judgment but augmenting it with data processing capabilities humans can't match.

The experience of building ProductPulse gave me practical skills in AI integration that will be valuable in my PM career - understanding what's possible, what's difficult, and how to design products that leverage AI effectively.

---

## Technical Details

### Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Convex (real-time database)
- **AI:** Google Gemini 3 (gemini-3-flash-preview)
- **Charts:** Recharts

### AI Integration Architecture

```
┌─────────────────┐
│   RSS Sources   │
│ Reddit, HN, SE  │
└────────┬────────┘
         │ Fetch (Scheduled/Manual)
         ▼
┌─────────────────┐
│   Feed Items    │
│  (Deduplicated) │
└────────┬────────┘
         │ Analyze
         ▼
┌─────────────────┐
│   Gemini 3 AI   │
│  - Sentiment    │
│  - Relevance    │
│  - Entities     │
│  - Themes       │
└────────┬────────┘
         │ Store
         ▼
┌─────────────────┐
│    Insights     │
│   Dashboard     │
└─────────────────┘
```

### Repository
https://github.com/ZeevBerland/ProductPulse

---

## Appendix

### A. Full Feature List
See [FEATURES.md](./FEATURES.md) for complete feature documentation.

### B. Screenshots
[ADD SCREENSHOTS OF KEY SCREENS]

### C. Video Demo
[INSERT VIDEO LINK]

---

*Submitted for AI-PM Metrics and Growth, January 2026*
