"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

// Types for AI suggestions
export interface SubredditSuggestion {
  name: string;
  description: string;
  relevanceScore: number;
}

export interface StackExchangeTag {
  tag: string;
  site: string;
}

export interface DiscourseForumSuggestion {
  name: string;
  domain: string;
}

export interface ProjectSuggestions {
  keywords: string[];
  competitors: string[];
  subreddits: SubredditSuggestion[];
  stackExchangeTags: StackExchangeTag[];
  hackerNewsQueries: string[];
  discourseForums: DiscourseForumSuggestion[];
  productCategory: string;
}

// Generate project setup suggestions using Gemini
export const suggestProjectSetup = action({
  args: {
    productName: v.string(),
    productDescription: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    suggestions: v.optional(v.any()),
    error: v.optional(v.string()),
  }),
  handler: async (_, args): Promise<{ success: boolean; suggestions?: ProjectSuggestions; error?: string }> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    if (args.productDescription.length < 20) {
      return { success: false, error: "Please provide a more detailed product description (at least 20 characters)" };
    }

    const prompt = `You are a product intelligence assistant helping set up monitoring for a product feedback tool.

Product Name: ${args.productName}
Product Description: ${args.productDescription}

Analyze this product and suggest a comprehensive monitoring configuration. Provide a JSON response with the following structure:

{
  "keywords": ["array of 10-15 relevant tracking keywords - include product name variations, key features, use cases, pain points users might discuss, and common misspellings"],
  "competitors": ["array of 3-6 likely competitors in this space that users might compare against"],
  "subreddits": [
    {"name": "subreddit_name_without_r_prefix", "description": "why this subreddit is relevant", "relevanceScore": 8}
  ],
  "stackExchangeTags": [
    {"tag": "tag-name", "site": "stackoverflow or other SE site"}
  ],
  "hackerNewsQueries": ["array of 3-5 search queries that would find relevant HN discussions"],
  "discourseForums": [
    {"name": "Forum Name", "domain": "forum.example.com"}
  ],
  "productCategory": "one of: saas, devtool, mobile-app, ecommerce, ai-ml, productivity, fintech, healthcare, education, social, gaming, other"
}

Guidelines:
- For subreddits: Include both niche subreddits specific to the product category AND broader tech/business subreddits. Score relevance 1-10.
- For keywords: Include the product name, common abbreviations, key features, and problems the product solves.
- For competitors: Focus on direct competitors users would likely compare.
- For Stack Exchange: Include relevant tags from stackoverflow, softwareengineering, ux.stackexchange, etc.
- For HN queries: Think about what Show HN posts or discussions would be relevant.
- For Discourse: Only include well-known public forums (like meta.discourse.org, community.openai.com, etc.) if relevant.

Respond ONLY with valid JSON, no other text or markdown.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              // Gemini 3 recommends keeping temperature at 1.0 (default)
              maxOutputTokens: 2048,
              thinkingConfig: {
                thinkingLevel: "low", // Low thinking for structured JSON generation
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("No response from Gemini");
      }

      // Parse JSON response, handling potential markdown code blocks
      const cleanJson = textContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const suggestions: ProjectSuggestions = JSON.parse(cleanJson);

      // Validate and normalize the response
      const normalized: ProjectSuggestions = {
        keywords: Array.isArray(suggestions.keywords) 
          ? suggestions.keywords.map(k => k.toLowerCase().trim()).slice(0, 15) 
          : [],
        competitors: Array.isArray(suggestions.competitors) 
          ? suggestions.competitors.slice(0, 6) 
          : [],
        subreddits: Array.isArray(suggestions.subreddits)
          ? suggestions.subreddits
              .map(s => ({
                name: s.name?.replace(/^r\//, "") || "",
                description: s.description || "",
                relevanceScore: Math.min(10, Math.max(1, s.relevanceScore || 5)),
              }))
              .filter(s => s.name)
              .slice(0, 10)
          : [],
        stackExchangeTags: Array.isArray(suggestions.stackExchangeTags)
          ? suggestions.stackExchangeTags
              .map(t => ({
                tag: t.tag?.toLowerCase() || "",
                site: t.site?.toLowerCase() || "stackoverflow",
              }))
              .filter(t => t.tag)
              .slice(0, 8)
          : [],
        hackerNewsQueries: Array.isArray(suggestions.hackerNewsQueries)
          ? suggestions.hackerNewsQueries.slice(0, 5)
          : [],
        discourseForums: Array.isArray(suggestions.discourseForums)
          ? suggestions.discourseForums
              .map(f => ({
                name: f.name || "",
                domain: f.domain?.replace(/^https?:\/\//, "").replace(/\/$/, "") || "",
              }))
              .filter(f => f.name && f.domain)
              .slice(0, 5)
          : [],
        productCategory: suggestions.productCategory || "other",
      };

      return { success: true, suggestions: normalized };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error generating suggestions:", errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});

// Types for competitor suggestions
export interface CompetitorSuggestion {
  name: string;
  description: string;
  website?: string;
  category: string;
}

// Suggest competitors for a product using Gemini
export const suggestCompetitors = action({
  args: {
    productName: v.string(),
    productDescription: v.string(),
    existingCompetitors: v.optional(v.array(v.string())),
  },
  returns: v.object({
    success: v.boolean(),
    competitors: v.optional(v.any()),
    error: v.optional(v.string()),
  }),
  handler: async (_, args): Promise<{ success: boolean; competitors?: CompetitorSuggestion[]; error?: string }> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    if (args.productDescription.length < 20) {
      return { success: false, error: "Please provide a more detailed product description (at least 20 characters)" };
    }

    const existingList = args.existingCompetitors?.length 
      ? `\n\nAlready tracking these competitors (suggest different ones): ${args.existingCompetitors.join(", ")}`
      : "";

    const prompt = `You are a competitive intelligence assistant. Analyze this product and identify its competitors.

Product Name: ${args.productName}
Product Description: ${args.productDescription}${existingList}

Identify 5-8 competitors for this product. For each competitor, provide:
1. Company/product name
2. Brief description of what they do (1-2 sentences)
3. Their website domain (if known)
4. Category: "direct" (same market), "indirect" (adjacent market), or "emerging" (potential future competitor)

Respond with a JSON array:
[
  {
    "name": "Competitor Name",
    "description": "What they do and why they compete",
    "website": "competitor.com",
    "category": "direct"
  }
]

Focus on:
- Direct competitors that solve the same problem
- Indirect competitors that users might consider as alternatives
- Emerging players that could become competitors

Respond ONLY with valid JSON array, no other text or markdown.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 2048,
              thinkingConfig: {
                thinkingLevel: "low",
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error("No response from Gemini");
      }

      // Parse JSON response
      const cleanJson = textContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const competitors: CompetitorSuggestion[] = JSON.parse(cleanJson);

      // Validate and normalize
      const normalized = Array.isArray(competitors)
        ? competitors
            .map((c) => ({
              name: c.name || "",
              description: c.description || "",
              website: c.website?.replace(/^https?:\/\//, "").replace(/\/$/, "") || undefined,
              category: ["direct", "indirect", "emerging"].includes(c.category) 
                ? c.category 
                : "direct",
            }))
            .filter((c) => c.name)
            .slice(0, 8)
        : [];

      return { success: true, competitors: normalized };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error suggesting competitors:", errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});
