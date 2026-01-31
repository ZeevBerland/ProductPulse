"use node";

import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Types for Gemini response
interface AnalysisResult {
  relevant: boolean;
  relevanceScore: number;
  sentiment: {
    score: number;
    label: "positive" | "negative" | "neutral";
  };
  entities: string[];
  themes: string[];
  summary: string;
  actionability: "high" | "medium" | "low";
}

// Result types
type AnalyzeResult = { success: boolean; skipped?: boolean; error?: string };
type BatchResult = { total: number; successful: number; skipped: number };

// Analyze a single feed item using Gemini
export const analyzeItem = internalAction({
  args: {
    feedItemId: v.id("feedItems"),
  },
  handler: async (ctx, args): Promise<AnalyzeResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY not configured" };
    }

    // Get the feed item
    const feedItem = await ctx.runQuery(internal.feeds.queries.getFeedItem, {
      id: args.feedItemId,
    });

    if (!feedItem) {
      return { success: false, error: "Feed item not found" };
    }

    if (feedItem.analyzed) {
      return { success: false, error: "Item already analyzed" };
    }

    // Get the source to find the project ID
    const source = await ctx.runQuery(internal.feeds.queries.getSource, {
      id: feedItem.sourceId,
    });

    if (!source) {
      return { success: false, error: "Source not found" };
    }

    // Get the project to access keywords and competitors
    const project = await ctx.runQuery(internal.feeds.queries.getProject, {
      id: source.projectId,
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Build keywords list for relevance checking
    const trackingTerms = [
      ...(project.keywords || []),
      ...(project.competitors || []),
    ];

    try {
      // Build the prompt with keyword context
      const prompt = `Analyze this content from an RSS feed for relevance to a product monitoring project.

TRACKED PRODUCT/KEYWORDS: ${trackingTerms.join(", ")}
PROJECT NAME: ${project.name}

CONTENT TO ANALYZE:
Title: ${feedItem.title}
Body: ${feedItem.content.substring(0, 2000)}

First, determine if this content is RELEVANT to the tracked product/keywords. Content is relevant if it:
- Mentions the product, its competitors, or related keywords
- Discusses topics directly related to the product's domain
- Contains feedback, questions, or discussions about similar tools

Provide a JSON response:
{
  "relevant": <true if content is relevant to tracked keywords, false if unrelated>,
  "relevanceScore": <0.0 to 1.0 - how relevant is this to the tracked product>,
  "sentiment": {
    "score": <number from -1 (very negative) to 1 (very positive)>,
    "label": "<positive|negative|neutral>"
  },
  "entities": [<product names, features, or competitors mentioned>],
  "themes": [<themes like: pricing, ux, performance, features, support, bugs, comparison, question, announcement>],
  "summary": "<1-2 sentence insight summary for a product manager>",
  "actionability": "<high|medium|low based on how actionable this feedback is>"
}

Respond ONLY with valid JSON, no other text.`;

      // Call Gemini API
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
              maxOutputTokens: 1024,
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

      // Parse the JSON response
      // Remove any markdown code blocks if present
      const cleanJson = textContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const analysis: AnalysisResult = JSON.parse(cleanJson);

      // Mark the item as analyzed regardless of relevance
      await ctx.runMutation(internal.feeds.mutations.markItemAnalyzed, {
        feedItemId: args.feedItemId,
      });

      // Skip creating insight if content is not relevant (relevanceScore < 0.3)
      const relevanceScore = analysis.relevanceScore ?? (analysis.relevant ? 0.5 : 0);
      if (!analysis.relevant || relevanceScore < 0.3) {
        console.log(`Skipping irrelevant item: "${feedItem.title.substring(0, 50)}..." (relevance: ${relevanceScore})`);
        return { success: true, skipped: true };
      }

      // Validate and normalize the analysis
      const sentimentScore = Math.max(-1, Math.min(1, analysis.sentiment.score));
      const sentimentLabel = analysis.sentiment.label || 
        (sentimentScore > 0.2 ? "positive" : sentimentScore < -0.2 ? "negative" : "neutral");

      // Create the insight (only for relevant content)
      await ctx.runMutation(internal.feeds.mutations.createInsight, {
        feedItemId: args.feedItemId,
        projectId: source.projectId,
        sourceId: source._id,
        sentimentScore,
        sentimentLabel,
        relevanceScore: Math.round(relevanceScore * 100) / 100, // Store normalized relevance
        entities: analysis.entities || [],
        themes: analysis.themes || [],
        summary: analysis.summary || "No summary available",
        actionability: analysis.actionability || "medium",
        feedItemTitle: feedItem.title,
        feedItemUrl: feedItem.url,
        feedItemPublishedAt: feedItem.publishedAt,
      });

      console.log(`Created insight for: "${feedItem.title.substring(0, 50)}..." (relevance: ${relevanceScore})`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error analyzing item ${args.feedItemId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});

// Analyze all unprocessed items (called by cron)
export const analyzeUnprocessed = internalAction({
  args: {},
  handler: async (ctx): Promise<BatchResult> => {
    // Get unanalyzed items (limit to prevent timeout)
    const items = await ctx.runQuery(internal.feeds.queries.getUnanalyzedItems, {
      limit: 10,
    });

    let successful = 0;
    let skipped = 0;

    for (const item of items) {
      const result = await ctx.runAction(internal.analysis.gemini.analyzeItem, {
        feedItemId: item._id,
      });

      if (result.success) {
        if (result.skipped) {
          skipped++;
        } else {
          successful++;
        }
      }

      // Minimal delay to avoid rate limiting (reduced for faster demo)
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return {
      total: items.length,
      successful,
      skipped,
    };
  },
});

// Public action to manually trigger analysis
export const triggerAnalysis = action({
  args: {
    feedItemId: v.id("feedItems"),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<AnalyzeResult> => {
    return await ctx.runAction(internal.analysis.gemini.analyzeItem, {
      feedItemId: args.feedItemId,
    });
  },
});

// Public action to trigger batch analysis
export const triggerBatchAnalysis = action({
  args: {},
  returns: v.object({
    total: v.number(),
    successful: v.number(),
    skipped: v.number(),
  }),
  handler: async (ctx): Promise<BatchResult> => {
    return await ctx.runAction(internal.analysis.gemini.analyzeUnprocessed, {});
  },
});

// Analyze unprocessed items for a specific project (for immediate analysis after fetch)
export const analyzeProjectItems = internalAction({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args): Promise<BatchResult> => {
    // Get unanalyzed items for this project
    const items = await ctx.runQuery(internal.feeds.queries.getUnanalyzedItemsForProject, {
      projectId: args.projectId,
      limit: 20, // Process up to 20 items immediately
    });

    let successful = 0;
    let skipped = 0;

    for (const item of items) {
      const result = await ctx.runAction(internal.analysis.gemini.analyzeItem, {
        feedItemId: item._id,
      });

      if (result.success) {
        if (result.skipped) {
          skipped++;
        } else {
          successful++;
        }
      }

      // Minimal delay for faster processing
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return {
      total: items.length,
      successful,
      skipped,
    };
  },
});
