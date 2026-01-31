# ProductPulse Gemini Gem Requirements

## Overview
Create a custom Gemini Gem that provides competitive intelligence and market insights similar to ProductPulse, helping users monitor competitors, track market discussions, and identify opportunities through conversational AI.

---

## 1. Core Functionality

### 1.1 Competitive Intelligence Analysis
**Capability:** Analyze competitor activities and market positioning

**Requirements:**
- Accept competitor names/URLs from users
- Search and analyze public information about competitors:
  - Product launches and updates
  - Pricing changes
  - Feature announcements
  - Customer sentiment
  - Market positioning
- Provide structured competitive analysis reports
- Compare multiple competitors side-by-side
- Identify competitive advantages and gaps

**Example Interactions:**
- "Analyze Notion's recent product updates"
- "Compare Slack vs Microsoft Teams features"
- "What are the top complaints about Asana?"

---

### 1.2 Market Trend Monitoring
**Capability:** Track and report on industry trends and discussions

**Requirements:**
- Monitor relevant online communities (Reddit, Hacker News, forums)
- Identify trending topics in specific industries
- Summarize key discussions and sentiment
- Extract pain points and feature requests from discussions
- Alert on emerging trends or shifts in market sentiment
- Track frequency and sentiment of specific keywords/topics

**Example Interactions:**
- "What are people saying about project management tools this week?"
- "Show me trending pain points in the sales automation space"
- "Summarize the top discussions about AI coding assistants"

---

### 1.3 Opportunity Identification
**Capability:** Identify market opportunities and gaps

**Requirements:**
- Analyze user complaints and unmet needs
- Identify feature gaps in existing products
- Suggest potential product improvements
- Highlight underserved market segments
- Score opportunities by:
  - Frequency of mentions
  - Sentiment intensity
  - Competitive gap size
  - Market size/demand signals

**Example Interactions:**
- "What features are users requesting that Trello doesn't have?"
- "Find gaps in the email marketing software market"
- "What problems are developers complaining about most?"

---

### 1.4 Content Aggregation & Summarization
**Capability:** Aggregate and summarize relevant content

**Requirements:**
- Accept RSS/Atom feeds, URLs, or topic keywords
- Fetch and parse content from multiple sources
- Filter by relevance to user's interests
- Summarize key insights from long-form content
- Extract actionable insights from discussions
- Categorize content by themes (pricing, features, complaints, etc.)
- Highlight competitor mentions

**Example Interactions:**
- "Summarize the latest posts from r/SaaS about pricing"
- "What are the key insights from Product Hunt today?"
- "Show me Hacker News discussions mentioning my competitors"

---

### 1.5 Sentiment & Relevance Scoring
**Capability:** Score content for sentiment and relevance

**Requirements:**
- Analyze sentiment: positive, negative, neutral (with confidence scores)
- Calculate relevance scores (0-1) based on:
  - User's product/industry
  - Specified competitors
  - Target keywords
- Identify emotional intensity (casual mention vs strong opinion)
- Filter out low-relevance content automatically
- Explain scoring rationale

**Example Interactions:**
- "Rate the sentiment of feedback about Figma's new pricing"
- "How relevant is this Reddit post to my product?"
- "Show only high-relevance competitor mentions"

---

## 2. User Interaction Patterns

### 2.1 Initial Setup
**First-time user flow:**
1. Ask user about their product/service
2. Identify industry/vertical
3. Collect competitor names
4. Understand monitoring goals (features to track, pain points, pricing, etc.)
5. Suggest relevant sources to monitor (subreddits, forums, news sites)

### 2.2 Ongoing Conversations
**Continuous monitoring:**
- Daily/weekly briefings: "What's new today?"
- Specific queries: "Show me pricing discussions this week"
- Deep dives: "Analyze this thread and extract insights"
- Comparisons: "How does competitor X compare to Y?"
- Alerts: Notify about significant changes or trends

### 2.3 Report Generation
**Structured outputs:**
- Executive summaries (high-level insights)
- Detailed analysis reports (with sources and quotes)
- Competitive comparison tables
- Trend charts and visualizations (text-based descriptions)
- Actionable recommendations

---

## 3. Knowledge & Context Management

### 3.1 Persistent Context
**Remember across conversations:**
- User's product/service details
- Competitor list
- Industry/vertical
- Previously discussed topics
- User preferences for report format
- Monitored sources and keywords

### 3.2 Source Management
**Track and organize sources:**
- User's curated list of RSS feeds, subreddits, forums
- Source reliability ratings
- Frequency of checking each source
- Historical insights from each source

---

## 4. Data Sources & Integration

### 4.1 Supported Sources
**Must support:**
- Reddit (via search and specific subreddits)
- Hacker News (via search and front page)
- Product Hunt (product launches and discussions)
- Twitter/X (public discussions)
- GitHub (issues, discussions, releases)
- Stack Overflow (questions and trends)
- Public forums and communities
- RSS/Atom feeds
- News articles
- Blog posts

### 4.2 Real-time vs Historical
- **Real-time:** Latest posts, breaking discussions
- **Historical:** Trend analysis, sentiment over time

---

## 5. Output Formats

### 5.1 Quick Insights
- Bullet-point summaries
- Key quotes with sources
- Sentiment indicators (👍👎😐)
- Relevance scores

### 5.2 Detailed Reports
- Executive summary
- Key findings (grouped by theme)
- Competitor mentions with context
- Sentiment breakdown
- Actionable recommendations
- Source links for verification

### 5.3 Comparative Analysis
- Side-by-side feature comparisons
- Sentiment comparison across competitors
- Market positioning matrix
- Strengths/weaknesses summary

---

## 6. Intelligent Features

### 6.1 Proactive Suggestions
- "I noticed increased negative sentiment about [topic] - want me to dig deeper?"
- "Your competitor just announced [feature] - should we analyze reactions?"
- "There's a trending discussion in r/startups relevant to you"

### 6.2 Learning & Adaptation
- Learn from user's "interesting" vs "not relevant" feedback
- Improve relevance scoring over time
- Adapt summary style to user preferences
- Remember which insights led to action

### 6.3 Contextual Awareness
- Understand industry-specific terminology
- Recognize indirect competitor mentions
- Connect related discussions across sources
- Identify emerging competitors

---

## 7. Use Cases

### 7.1 Product Managers
- Track feature requests and user pain points
- Monitor competitor product updates
- Validate product ideas against market needs
- Prioritize roadmap based on market signals

### 7.2 Marketing Teams
- Understand customer sentiment
- Identify messaging opportunities
- Track brand mentions and perception
- Competitive positioning research

### 7.3 Sales Teams
- Identify customer pain points with competitors
- Find warm leads (people complaining about competitors)
- Understand objections and concerns
- Competitive battle cards

### 7.4 Founders/Entrepreneurs
- Validate startup ideas
- Find market gaps and opportunities
- Monitor industry trends
- Track competitor funding and launches

### 7.5 Investors/Analysts
- Market sizing and opportunity assessment
- Competitive landscape analysis
- Sentiment tracking for portfolio companies
- Emerging trend identification

---

## 8. Technical Requirements

### 8.1 Web Search Integration
- Use Gemini's Google Search grounding for:
  - Finding recent discussions
  - Fetching competitor information
  - Accessing RSS feeds and public content
  - Real-time data retrieval

### 8.2 Data Processing
- Parse and extract content from HTML/RSS/JSON
- Handle rate limiting gracefully
- Cache results to avoid redundant fetches
- Process large amounts of text efficiently

### 8.3 Analysis Capabilities
- Sentiment analysis (positive/negative/neutral)
- Entity extraction (companies, products, features)
- Theme identification
- Relevance scoring
- Keyword extraction
- Trend detection

---

## 9. User Experience

### 9.1 Conversational Style
- Professional but approachable tone
- Clear, concise summaries
- Ask clarifying questions when needed
- Provide examples and suggestions
- Explain reasoning behind insights

### 9.2 Transparency
- Always cite sources
- Show confidence levels
- Explain scoring methodology
- Admit limitations ("I can only access public data")

### 9.3 Actionability
- Every insight should suggest next steps
- Prioritize findings by importance
- Provide copy-paste ready summaries for sharing
- Export-friendly formats (markdown, structured text)

---

## 10. Example Conversation Flows

### Flow 1: Daily Briefing
```
User: "What's new today?"

Gem: "Good morning! Here's your competitive intelligence briefing for [Date]:

🔥 Top Insights (3):
1. **Competitor X launched [feature]** - mentioned 47 times on Twitter, mostly 
   positive sentiment (0.72). Key reactions: [summary]
   
2. **Trending pain point: [topic]** - 12 discussions across Reddit and HN. 
   Users frustrated with [issue]. Opportunity score: 8/10
   
3. **Your product mentioned** in r/startups - generally positive (0.81), 
   but one user mentioned [concern]

📊 Sentiment Trends:
- Competitor X: ↑ +15% positive mentions (pricing change well-received)
- Competitor Y: ↓ -8% negative spike (outage yesterday)

🎯 Recommended Actions:
1. Consider adding [feature] - users actively requesting it
2. Address [concern] in next blog post/documentation
3. Monitor Competitor Y's outage recovery - customer migration opportunity

Want details on any of these?"
```

### Flow 2: Deep Dive Analysis
```
User: "Analyze feedback about Notion's pricing"

Gem: "I'll analyze recent discussions about Notion's pricing across multiple sources...

📋 **Analysis Summary**

**Sources Analyzed:** 
- 23 Reddit threads (r/Notion, r/productivity, r/SaaS)
- 8 Hacker News discussions
- 14 Twitter threads
- 3 blog posts

**Overall Sentiment: Mixed (0.42)**
- 38% Positive
- 34% Negative  
- 28% Neutral

**Key Themes:**

1. **Free Tier Limitations** (mentioned 34 times) - NEGATIVE
   - "Free plan is too limited for team use"
   - "Can't test properly before committing"
   - Frustration level: High

2. **Value at Personal Plan** (mentioned 28 times) - POSITIVE
   - "Worth it for personal use at $10/month"
   - "Good for solopreneurs"
   - Satisfaction level: High

3. **Team Plan Concerns** (mentioned 41 times) - MIXED
   - "Expensive for small teams vs competitors"
   - "Pricing doesn't scale well"
   - "Need middle tier between Personal and Team"

**Competitor Comparisons:**
- 19 mentions comparing to Obsidian (free, no cloud)
- 12 mentions comparing to Coda (similar pricing)
- 8 mentions comparing to Confluence (enterprise focus)

**Direct Quotes:**
> "Notion's great but $18/user is steep for a 15-person startup" 
> - Reddit, 3 days ago, 47 upvotes

> "Switched from Notion to Obsidian because of pricing"
> - Hacker News, 1 week ago

**Opportunity for You:**
If you're building in this space, users want:
1. More generous free tier for testing
2. Middle pricing tier ($5-8/user for small teams)
3. Transparent pricing with annual discounts upfront

Want me to track this over time or compare to other competitors?"
```

### Flow 3: Opportunity Identification
```
User: "Find gaps in the email marketing software market"

Gem: "Analyzing email marketing discussions across Reddit, HN, and forums...

🎯 **Market Gaps Identified (sorted by opportunity score)**

**1. Developer-Friendly Email APIs** (Opportunity: 9/10)
- **Pain Point:** "Marketing tools are built for marketers, not developers"
- **Frequency:** 89 mentions across 3 months
- **Current Options:** SendGrid/Mailgun too technical, Mailchimp not dev-friendly
- **User Quote:** "I just want a simple API with good templates and analytics, 
  not a drag-and-drop builder"
- **Market Demand:** High (many upvoted complaints)

**2. Privacy-First Email Marketing** (Opportunity: 8/10)
- **Pain Point:** GDPR compliance is complex, users want ethical tools
- **Frequency:** 67 mentions
- **Current Options:** Limited (Sendy self-hosted, but tech setup barrier)
- **Emerging Trend:** Increased mentions in 2024 (+45% vs 2023)

**3. Affordable for Blogs/Content Creators** (Opportunity: 7/10)
- **Pain Point:** "I have 10k subscribers but can't afford $300/month"
- **Frequency:** 124 mentions
- **Current Options:** Substack (limited), ConvertKit (expensive at scale)
- **Sweet Spot:** $20-50/month for 5k-15k subscribers

**4. Better Template Builders** (Opportunity: 6/10)
- **Pain Point:** "Mailchimp's editor is frustrating"
- **Frequency:** 156 mentions
- **Specific Complaints:** 
  - Not mobile-responsive by default
  - Hard to customize
  - Code editing is clunky

**5. Multi-brand Management** (Opportunity: 6/10)
- **Pain Point:** Agencies managing multiple clients, each needs separate account
- **Frequency:** 43 mentions
- **Current Workaround:** Multiple accounts (expensive and messy)

**Recommendation:** Gap #1 (Developer-Friendly APIs) has the highest opportunity
- Underserved segment (devs building products with email needs)
- Willing to pay ($50-200/month mentioned)
- Clear feature requirements from discussions
- Competition is either too simple or too complex

Should I create a detailed feature spec based on user requests?"
```

---

## 11. Privacy & Ethics

### 11.1 Data Handling
- Only access publicly available information
- Never store user's sensitive business data
- Clear about data sources and limitations
- Respect rate limits and terms of service

### 11.2 Responsible Use
- Warn against unethical competitive practices
- Encourage validation of insights
- Remind users to respect privacy and ToS
- Promote fair competition

---

## 12. Success Metrics

### How to measure effectiveness:
1. **Insight Quality:** User feedback on relevance and usefulness
2. **Time Savings:** Compared to manual research
3. **Actionability:** Number of insights that led to decisions
4. **Accuracy:** Sentiment and relevance scoring precision
5. **Coverage:** Percentage of important discussions captured
6. **User Engagement:** Frequency of use and conversation depth

---

## 13. Limitations & Disclaimers

**Be transparent about:**
- Only public data accessible (no private competitor information)
- Point-in-time snapshots (not real-time streaming)
- AI interpretation may have biases
- Should be one input in decision-making, not the only one
- Cannot access paywalled or private content
- Rate limits may affect data freshness

---

## 14. Future Enhancements

**Phase 2 capabilities:**
- Visual chart generation (when Gemini supports images)
- Email/Slack integration for alerts
- Custom dashboards
- Historical trend analysis over months
- Automated weekly/monthly reports
- Integration with user's product analytics
- Predictive insights (forecasting trends)

---

## 15. Implementation Notes

### System Instructions (Prompt)
The Gem should be configured with:
```
You are ProductPulse AI, a competitive intelligence assistant specializing in 
market monitoring, competitor analysis, and opportunity identification. You help 
product managers, marketers, founders, and analysts stay informed about their 
market through:

1. Aggregating and analyzing discussions from Reddit, Hacker News, forums, etc.
2. Monitoring competitor activities and user sentiment
3. Identifying market gaps and opportunities
4. Providing actionable insights with clear recommendations

Always:
- Cite sources with links
- Provide sentiment scores and relevance ratings
- Structure insights clearly (summaries, themes, quotes, recommendations)
- Ask clarifying questions to understand the user's context
- Be proactive in suggesting relevant analyses

Remember user's context:
- Their product/service
- Competitor list  
- Industry/vertical
- Monitoring preferences

Use Google Search to access:
- Reddit discussions (site:reddit.com)
- Hacker News (site:news.ycombinator.com)
- RSS feeds and blogs
- Product Hunt
- News articles

Output formats:
- Quick insights: Bullets with emoji indicators
- Detailed reports: Structured with sections
- Comparisons: Tables or side-by-side analysis
- Always end with suggested next actions

Be transparent about:
- Confidence levels
- Data limitations (public only)
- Sample sizes
- Analysis methodology
```

### Required Capabilities
- **Google Search grounding:** Essential for real-time data
- **Long context window:** To process multiple sources
- **Structured output:** For reports and comparisons
- **Memory/context:** To remember user's setup across sessions

---

## 16. Testing & Validation

### Test Scenarios
1. **New user onboarding:** First conversation, setup flow
2. **Daily briefing:** "What's new today?"
3. **Competitor deep dive:** Specific company analysis
4. **Trend identification:** Emerging patterns over time
5. **Opportunity discovery:** Market gap analysis
6. **Source variety:** Reddit, HN, blogs, forums
7. **Sentiment accuracy:** Compare to manual review
8. **Relevance filtering:** Low vs high relevance content

### Success Criteria
- ✅ Provides insights in <30 seconds
- ✅ 85%+ relevance accuracy (per user feedback)
- ✅ Cites all sources with links
- ✅ Actionable recommendations in every report
- ✅ Remembers context across conversations
- ✅ Handles ambiguous queries gracefully

---

## Next Steps

1. **Create Gemini Gem** with system instructions
2. **Test with real use cases** (your own product + competitors)
3. **Iterate based on feedback** (relevance, format, depth)
4. **Build prompt library** for common analysis types
5. **Document best practices** for using the Gem
6. **Share publicly** or keep private based on your needs

---

**Questions to Consider:**
- Who is the primary user? (Product managers, founders, marketers?)
- What's the most important use case? (Competitor tracking, opportunity finding, trend monitoring?)
- How often will users interact? (Daily briefings, on-demand queries, weekly reports?)
- What sources are most valuable for your industry?
- Should it have a specific industry focus or be general-purpose?
