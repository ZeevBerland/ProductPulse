// Source URL builders and templates for RSS feeds

export type SourceType = "reddit" | "hackernews" | "stackexchange" | "discourse" | "rss";

export interface SourceConfig {
  type: SourceType;
  name: string;
  feedUrl: string;
  description?: string;
}

// Reddit URL builders
export const redditUrls = {
  subreddit: (subreddit: string) => 
    `https://www.reddit.com/r/${subreddit}.rss`,
  
  subredditSearch: (subreddit: string, keyword: string) =>
    `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(keyword)}&sort=new&restrict_sr=on`,
  
  multiSubreddit: (subreddits: string[]) =>
    `https://www.reddit.com/r/${subreddits.join("+")}.rss`,
};

// Hacker News URL builders (via hnrss.org)
export const hackerNewsUrls = {
  search: (query: string) =>
    `https://hnrss.org/newest?q=${encodeURIComponent(query)}`,
  
  frontpage: () =>
    "https://hnrss.org/frontpage",
  
  showHN: (query?: string) =>
    query 
      ? `https://hnrss.org/show?q=${encodeURIComponent(query)}`
      : "https://hnrss.org/show",
  
  askHN: () =>
    "https://hnrss.org/ask",
  
  bestComments: (query?: string) =>
    query
      ? `https://hnrss.org/bestcomments?q=${encodeURIComponent(query)}`
      : "https://hnrss.org/bestcomments",
};

// Stack Exchange URL builders
export const stackExchangeUrls = {
  tag: (site: string, tag: string) => {
    // Handle special case for stackoverflow
    if (site === "stackoverflow") {
      return `https://stackoverflow.com/feeds/tag/${encodeURIComponent(tag)}`;
    }
    return `https://${site}.stackexchange.com/feeds/tag/${encodeURIComponent(tag)}`;
  },
  
  // Common SE sites
  sites: {
    stackoverflow: "stackoverflow",
    softwareengineering: "softwareengineering",
    ux: "ux",
    webapps: "webapps",
    superuser: "superuser",
    serverfault: "serverfault",
    dba: "dba",
    security: "security",
    devops: "devops",
    datascience: "datascience",
    ai: "ai",
  } as const,
};

// Discourse URL builders
export const discourseUrls = {
  latest: (domain: string) =>
    `https://${domain}/latest.rss`,
  
  category: (domain: string, category: string) =>
    `https://${domain}/c/${category}.rss`,
  
  tag: (domain: string, tag: string) =>
    `https://${domain}/tag/${tag}.rss`,
};

// Build source configs from AI suggestions
export function buildRedditSource(subredditName: string, description?: string): SourceConfig {
  return {
    type: "reddit",
    name: `r/${subredditName}`,
    feedUrl: redditUrls.subreddit(subredditName),
    description: description || `Reddit discussions from r/${subredditName}`,
  };
}

export function buildHackerNewsSource(query: string): SourceConfig {
  return {
    type: "hackernews",
    name: `HN: "${query}"`,
    feedUrl: hackerNewsUrls.search(query),
    description: `Hacker News discussions mentioning "${query}"`,
  };
}

export function buildStackExchangeSource(tag: string, site: string): SourceConfig {
  const siteName = site === "stackoverflow" ? "Stack Overflow" : site;
  return {
    type: "stackexchange",
    name: `${siteName}: ${tag}`,
    feedUrl: stackExchangeUrls.tag(site, tag),
    description: `Questions tagged [${tag}] on ${siteName}`,
  };
}

export function buildDiscourseSource(name: string, domain: string): SourceConfig {
  return {
    type: "discourse",
    name: name,
    feedUrl: discourseUrls.latest(domain),
    description: `Latest discussions from ${name}`,
  };
}

// Industry templates with pre-configured suggestions
export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subreddits: Array<{ name: string; description: string }>;
  stackExchangeTags: Array<{ tag: string; site: string }>;
  hackerNewsQueries: string[];
}

export const industryTemplates: IndustryTemplate[] = [
  {
    id: "saas",
    name: "SaaS Tool",
    description: "Software-as-a-Service product",
    keywords: ["saas", "subscription", "cloud software", "b2b", "enterprise"],
    subreddits: [
      { name: "SaaS", description: "SaaS business discussions" },
      { name: "startups", description: "Startup community" },
      { name: "Entrepreneur", description: "Business and entrepreneurship" },
      { name: "smallbusiness", description: "Small business owners" },
    ],
    stackExchangeTags: [
      { tag: "saas", site: "softwareengineering" },
    ],
    hackerNewsQueries: ["SaaS", "B2B software"],
  },
  {
    id: "devtool",
    name: "Developer Tool / API",
    description: "Tools and APIs for developers",
    keywords: ["developer tool", "api", "sdk", "cli", "devops", "developer experience"],
    subreddits: [
      { name: "programming", description: "General programming" },
      { name: "webdev", description: "Web development" },
      { name: "devops", description: "DevOps practices" },
      { name: "node", description: "Node.js community" },
      { name: "Python", description: "Python development" },
      { name: "golang", description: "Go programming" },
    ],
    stackExchangeTags: [
      { tag: "api", site: "stackoverflow" },
      { tag: "api-design", site: "softwareengineering" },
    ],
    hackerNewsQueries: ["Show HN", "developer tools", "API"],
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "iOS or Android application",
    keywords: ["mobile app", "ios", "android", "app store", "mobile"],
    subreddits: [
      { name: "iOSProgramming", description: "iOS development" },
      { name: "androiddev", description: "Android development" },
      { name: "apps", description: "App discussions" },
      { name: "AppBusiness", description: "App business strategies" },
    ],
    stackExchangeTags: [
      { tag: "ios", site: "stackoverflow" },
      { tag: "android", site: "stackoverflow" },
      { tag: "mobile", site: "ux" },
    ],
    hackerNewsQueries: ["mobile app", "iOS", "Android"],
  },
  {
    id: "ai-ml",
    name: "AI/ML Product",
    description: "Artificial intelligence or machine learning product",
    keywords: ["ai", "machine learning", "llm", "gpt", "artificial intelligence", "ml"],
    subreddits: [
      { name: "MachineLearning", description: "ML research and applications" },
      { name: "artificial", description: "AI discussions" },
      { name: "LocalLLaMA", description: "Local LLM community" },
      { name: "ChatGPT", description: "ChatGPT and LLM users" },
      { name: "OpenAI", description: "OpenAI discussions" },
    ],
    stackExchangeTags: [
      { tag: "machine-learning", site: "stackoverflow" },
      { tag: "artificial-intelligence", site: "ai" },
      { tag: "nlp", site: "datascience" },
    ],
    hackerNewsQueries: ["AI", "LLM", "machine learning", "GPT"],
  },
  {
    id: "productivity",
    name: "Productivity App",
    description: "Task management, notes, or productivity tool",
    keywords: ["productivity", "task management", "notes", "organization", "workflow"],
    subreddits: [
      { name: "productivity", description: "Productivity tips and tools" },
      { name: "notion", description: "Notion users" },
      { name: "ObsidianMD", description: "Obsidian community" },
      { name: "gtd", description: "Getting Things Done methodology" },
      { name: "projectmanagement", description: "Project management" },
    ],
    stackExchangeTags: [
      { tag: "productivity", site: "softwareengineering" },
    ],
    hackerNewsQueries: ["productivity", "task management", "note-taking"],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online store or marketplace",
    keywords: ["ecommerce", "online store", "shopping", "marketplace", "retail"],
    subreddits: [
      { name: "ecommerce", description: "E-commerce discussions" },
      { name: "shopify", description: "Shopify merchants" },
      { name: "FulfillmentByAmazon", description: "Amazon sellers" },
      { name: "Etsy", description: "Etsy sellers" },
    ],
    stackExchangeTags: [
      { tag: "e-commerce", site: "webapps" },
    ],
    hackerNewsQueries: ["ecommerce", "online store", "marketplace"],
  },
  {
    id: "fintech",
    name: "Fintech",
    description: "Financial technology product",
    keywords: ["fintech", "payments", "banking", "finance", "crypto", "trading"],
    subreddits: [
      { name: "fintech", description: "Fintech industry" },
      { name: "personalfinance", description: "Personal finance" },
      { name: "investing", description: "Investment discussions" },
      { name: "CryptoCurrency", description: "Cryptocurrency" },
    ],
    stackExchangeTags: [
      { tag: "finance", site: "stackoverflow" },
      { tag: "payments", site: "stackoverflow" },
    ],
    hackerNewsQueries: ["fintech", "payments", "banking API"],
  },
  {
    id: "education",
    name: "EdTech",
    description: "Education technology product",
    keywords: ["edtech", "learning", "education", "courses", "e-learning", "lms"],
    subreddits: [
      { name: "edtech", description: "Education technology" },
      { name: "learnprogramming", description: "Learning to code" },
      { name: "OnlineEducation", description: "Online learning" },
      { name: "Teachers", description: "Teacher community" },
    ],
    stackExchangeTags: [
      { tag: "education", site: "softwareengineering" },
    ],
    hackerNewsQueries: ["edtech", "online learning", "education"],
  },
];

// Get template by ID
export function getTemplateById(id: string): IndustryTemplate | undefined {
  return industryTemplates.find(t => t.id === id);
}

// Convert template to source configs
export function templateToSources(template: IndustryTemplate): SourceConfig[] {
  const sources: SourceConfig[] = [];

  // Add subreddit sources
  template.subreddits.forEach(sub => {
    sources.push(buildRedditSource(sub.name, sub.description));
  });

  // Add HN sources
  template.hackerNewsQueries.forEach(query => {
    sources.push(buildHackerNewsSource(query));
  });

  // Add SE sources
  template.stackExchangeTags.forEach(tag => {
    sources.push(buildStackExchangeSource(tag.tag, tag.site));
  });

  return sources;
}
