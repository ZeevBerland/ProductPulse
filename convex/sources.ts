import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const sourceTypeValidator = v.union(
  v.literal("reddit"),
  v.literal("hackernews"),
  v.literal("stackexchange"),
  v.literal("discourse"),
  v.literal("rss")
);

// List sources for a project
export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return sources;
  },
});

// Get a single source
export const get = query({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get source with feed item count
export const getWithStats = query({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.id);
    if (!source) return null;

    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_source", (q) => q.eq("sourceId", args.id))
      .collect();

    const analyzedCount = feedItems.filter((item) => item.analyzed).length;

    return {
      ...source,
      stats: {
        totalItems: feedItems.length,
        analyzedItems: analyzedCount,
        pendingAnalysis: feedItems.length - analyzedCount,
      },
    };
  },
});

// List all active sources (for cron job)
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return sources;
  },
});

// Create a new source
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: sourceTypeValidator,
    name: v.string(),
    feedUrl: v.string(),
    config: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const sourceId = await ctx.db.insert("sources", {
      projectId: args.projectId,
      type: args.type,
      name: args.name,
      feedUrl: args.feedUrl,
      active: true,
      config: args.config,
    });
    return sourceId;
  },
});

// Update a source
export const update = mutation({
  args: {
    id: v.id("sources"),
    name: v.optional(v.string()),
    feedUrl: v.optional(v.string()),
    config: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

// Toggle source active status
export const toggle = mutation({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.id);
    if (!source) throw new Error("Source not found");

    await ctx.db.patch(args.id, { active: !source.active });
    return args.id;
  },
});

// Update last fetched timestamp
export const updateLastFetched = mutation({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastFetched: Date.now() });
    return args.id;
  },
});

// Delete a source and its feed items
export const remove = mutation({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    // Get the source to find project ID
    const source = await ctx.db.get(args.id);
    if (!source) throw new Error("Source not found");

    // Delete all feed items for this source
    const feedItems = await ctx.db
      .query("feedItems")
      .withIndex("by_source", (q) => q.eq("sourceId", args.id))
      .collect();

    for (const item of feedItems) {
      // Delete insights for this feed item
      const insights = await ctx.db
        .query("insights")
        .withIndex("by_feedItem", (q) => q.eq("feedItemId", item._id))
        .collect();
      
      for (const insight of insights) {
        await ctx.db.delete(insight._id);
      }
      
      await ctx.db.delete(item._id);
    }

    // Delete the source
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// RSS Feed URL templates
export const feedTemplates = {
  reddit: {
    subreddit: "https://www.reddit.com/r/{subreddit}.rss",
    search: "https://www.reddit.com/r/{subreddit}/search.rss?q={keyword}&sort=new&restrict_sr=on",
  },
  hackernews: {
    newest: "https://hnrss.org/newest?q={keyword}",
    frontpage: "https://hnrss.org/frontpage",
    showhn: "https://hnrss.org/show?q={keyword}",
    askhn: "https://hnrss.org/ask",
  },
  stackexchange: {
    tag: "https://{site}.stackexchange.com/feeds/tag/{tag}",
    stackoverflow: "https://stackoverflow.com/feeds/tag/{tag}",
  },
  discourse: {
    latest: "https://{domain}/latest.rss",
    category: "https://{domain}/c/{category}.rss",
    tag: "https://{domain}/tag/{tag}.rss",
  },
};
