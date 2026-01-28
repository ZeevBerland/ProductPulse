import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

// Insert a feed item (with deduplication) - internal
export const insertFeedItem = internalMutation({
  args: {
    sourceId: v.id("sources"),
    externalId: v.string(),
    title: v.string(),
    content: v.string(),
    url: v.string(),
    author: v.optional(v.string()),
    publishedAt: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    // Check for existing item
    const existing = await ctx.db
      .query("feedItems")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", args.sourceId).eq("externalId", args.externalId)
      )
      .first();

    if (existing) {
      return false; // Item already exists
    }

    // Insert new item
    await ctx.db.insert("feedItems", {
      sourceId: args.sourceId,
      externalId: args.externalId,
      title: args.title,
      content: args.content,
      url: args.url,
      author: args.author,
      publishedAt: args.publishedAt,
      fetchedAt: Date.now(),
      analyzed: false,
    });

    return true; // Item was inserted
  },
});

// Update source last fetched timestamp - internal
export const updateSourceLastFetched = internalMutation({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, { lastFetched: Date.now() });
  },
});

// Mark feed item as analyzed - internal
export const markItemAnalyzed = internalMutation({
  args: { feedItemId: v.id("feedItems") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedItemId, { analyzed: true });
  },
});

// Set project fetch status - internal
export const setProjectFetchStatus = internalMutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(v.literal("idle"), v.literal("fetching"), v.literal("stopping")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, { fetchStatus: args.status });
  },
});

// Create an insight - internal
export const createInsight = internalMutation({
  args: {
    feedItemId: v.id("feedItems"),
    projectId: v.id("projects"),
    sourceId: v.id("sources"),
    sentimentScore: v.number(),
    sentimentLabel: v.union(
      v.literal("positive"),
      v.literal("negative"),
      v.literal("neutral")
    ),
    relevanceScore: v.optional(v.number()), // 0 to 1 - how relevant to tracked keywords
    entities: v.array(v.string()),
    themes: v.array(v.string()),
    summary: v.string(),
    actionability: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    feedItemTitle: v.string(),
    feedItemUrl: v.string(),
    feedItemPublishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const insightId = await ctx.db.insert("insights", {
      ...args,
      analyzedAt: Date.now(),
    });
    return insightId;
  },
});
