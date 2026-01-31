// RSS/Atom feed parser for Convex actions
// Uses simple regex-based parsing since we're in a Convex action environment

// Safety limits for parsing
const MAX_REGEX_ITERATIONS = 10000;
const FETCH_TIMEOUT_MS = 15000; // 15 seconds timeout (reduced for faster demo)

export interface FeedItem {
  id: string;
  title: string;
  content: string;
  link: string;
  author?: string;
  pubDate: Date;
}

export interface ParsedFeed {
  title: string;
  items: FeedItem[];
}

// Helper to decode HTML entities
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

// Strip HTML tags from content
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract text content between XML tags
function extractTag(xml: string, tagName: string): string | null {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tagName}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Try regular tag content
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = xml.match(regex);
  if (match) {
    return decodeHtmlEntities(match[1].trim());
  }

  // Try self-closing or attribute-based (like <link href="..."/>)
  const attrRegex = new RegExp(`<${tagName}[^>]*\\s(?:href|url)=["']([^"']+)["'][^>]*/>`, "i");
  const attrMatch = xml.match(attrRegex);
  if (attrMatch) {
    return attrMatch[1];
  }

  return null;
}

// Extract attribute value
function extractAttribute(xml: string, tagName: string, attrName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["']`, "i");
  const match = xml.match(regex);
  return match ? match[1] : null;
}

// Parse RSS 2.0 feed
function parseRSS(xml: string): ParsedFeed {
  const items: FeedItem[] = [];
  const feedTitle = extractTag(xml, "title") || "Unknown Feed";

  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;
  let iterations = 0;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    // Safety guard: prevent infinite loops with malformed XML
    if (++iterations > MAX_REGEX_ITERATIONS) {
      console.warn(`RSS parsing: iteration limit reached (${MAX_REGEX_ITERATIONS}), stopping parse`);
      break;
    }

    const itemXml = itemMatch[1];

    const title = extractTag(itemXml, "title") || "Untitled";
    const link = extractTag(itemXml, "link") || "";
    const description = extractTag(itemXml, "description") || "";
    const content = extractTag(itemXml, "content:encoded") || description;
    const author = extractTag(itemXml, "author") || extractTag(itemXml, "dc:creator") || undefined;
    const guid = extractTag(itemXml, "guid") || link || title;
    const pubDateStr = extractTag(itemXml, "pubDate") || extractTag(itemXml, "dc:date");

    let pubDate = new Date();
    if (pubDateStr) {
      const parsed = new Date(pubDateStr);
      if (!isNaN(parsed.getTime())) {
        pubDate = parsed;
      }
    }

    items.push({
      id: guid,
      title: stripHtml(title),
      content: stripHtml(content),
      link,
      author,
      pubDate,
    });
  }

  return { title: feedTitle, items };
}

// Parse Atom feed
function parseAtom(xml: string): ParsedFeed {
  const items: FeedItem[] = [];
  const feedTitle = extractTag(xml, "title") || "Unknown Feed";

  // Extract all <entry> elements
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let entryMatch;
  let iterations = 0;

  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    // Safety guard: prevent infinite loops with malformed XML
    if (++iterations > MAX_REGEX_ITERATIONS) {
      console.warn(`Atom parsing: iteration limit reached (${MAX_REGEX_ITERATIONS}), stopping parse`);
      break;
    }

    const entryXml = entryMatch[1];

    const title = extractTag(entryXml, "title") || "Untitled";
    const link = extractAttribute(entryXml, "link", "href") || extractTag(entryXml, "link") || "";
    const summary = extractTag(entryXml, "summary") || "";
    const content = extractTag(entryXml, "content") || summary;
    const authorName = extractTag(entryXml, "name") || undefined;
    const id = extractTag(entryXml, "id") || link || title;
    const updated = extractTag(entryXml, "updated") || extractTag(entryXml, "published");

    let pubDate = new Date();
    if (updated) {
      const parsed = new Date(updated);
      if (!isNaN(parsed.getTime())) {
        pubDate = parsed;
      }
    }

    items.push({
      id,
      title: stripHtml(title),
      content: stripHtml(content),
      link,
      author: authorName,
      pubDate,
    });
  }

  return { title: feedTitle, items };
}

// Main parser function
export function parseFeed(xml: string): ParsedFeed {
  // Determine feed type
  if (xml.includes("<feed") && xml.includes("xmlns=\"http://www.w3.org/2005/Atom\"")) {
    return parseAtom(xml);
  }
  // Default to RSS
  return parseRSS(xml);
}

// Helper for delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch and parse a feed URL with retry logic for rate limiting
export async function fetchFeed(url: string, retries = 1): Promise<ParsedFeed> {
  let lastError: Error | null = null;
  const isReddit = url.includes("reddit.com");
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      // Add initial delay for Reddit to avoid rate limiting
      if (isReddit && attempt === 0) {
        // 2-4 second initial delay for Reddit
        await sleep(2000 + Math.random() * 2000);
      }

      const response = await fetch(url, {
        headers: {
          // Use a realistic browser User-Agent for Reddit
          "User-Agent": isReddit 
            ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            : "Mozilla/5.0 (compatible; ProductPulse/1.0; +https://productpulse.app)",
          "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: controller.signal, // Add abort signal for timeout
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      // Handle rate limiting - wait and retry
      if (response.status === 429) {
        console.warn(`Rate limited on ${url} - waiting before retry`);
        // Wait 15-20 seconds before retry (Reddit needs longer cooldown)
        const rateLimitWait = isReddit ? 15000 + Math.random() * 5000 : 5000 + Math.random() * 3000;
        await sleep(rateLimitWait);
        lastError = new Error(`Rate limited by ${isReddit ? 'Reddit' : 'server'}`);
        continue; // Go to next retry attempt
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
      }

      const xml = await response.text();
      return parseFeed(xml);
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);

      // Handle timeout/abort specifically
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(`Fetch timeout after ${FETCH_TIMEOUT_MS / 1000} seconds: ${url}`);
        console.warn(lastError.message);
        // Don't retry on timeout - move to next attempt
        if (attempt >= retries) {
          break;
        }
        await sleep(isReddit ? 2000 : 1000);
        continue;
      }

      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on 404 or other client errors
      if (lastError.message.includes("404") || lastError.message.includes("403")) {
        throw lastError;
      }
      
      // Don't retry if we've exhausted attempts
      if (attempt >= retries) {
        break;
      }
      
      // Wait before retrying on other errors (reduced for faster demo)
      const waitTime = isReddit ? 3000 : 1000;
      await sleep(waitTime);
    }
  }

  throw lastError || new Error("Failed to fetch feed after retries");
}
