import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List feed items for a source
export const listBySource = query({
  args: {
    sourceId: v.id("sources"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("feedItems")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

// Get unanalyzed feed items
export const listUnanalyzed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("feedItems")
      .withIndex("by_analyzed", (q) => q.eq("analyzed", false))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

// Get a single feed item
export const get = query({
  args: { id: v.id("feedItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Check if a feed item already exists (for deduplication)
export const exists = query({
  args: {
    sourceId: v.id("sources"),
    externalId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("feedItems")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", args.sourceId).eq("externalId", args.externalId)
      )
      .first();
    return existing !== null;
  },
});

// Insert a new feed item (with deduplication)
export const upsert = mutation({
  args: {
    sourceId: v.id("sources"),
    externalId: v.string(),
    title: v.string(),
    content: v.string(),
    url: v.string(),
    author: v.optional(v.string()),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check for existing item
    const existing = await ctx.db
      .query("feedItems")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", args.sourceId).eq("externalId", args.externalId)
      )
      .first();

    if (existing) {
      // Update existing item if content changed
      if (existing.content !== args.content || existing.title !== args.title) {
        await ctx.db.patch(existing._id, {
          title: args.title,
          content: args.content,
          fetchedAt: Date.now(),
        });
      }
      return existing._id;
    }

    // Insert new item
    const itemId = await ctx.db.insert("feedItems", {
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

    return itemId;
  },
});

// Mark item as analyzed
export const markAnalyzed = mutation({
  args: { id: v.id("feedItems") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { analyzed: true });
    return args.id;
  },
});

// Batch insert feed items
export const batchInsert = mutation({
  args: {
    items: v.array(
      v.object({
        sourceId: v.id("sources"),
        externalId: v.string(),
        title: v.string(),
        content: v.string(),
        url: v.string(),
        author: v.optional(v.string()),
        publishedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const insertedIds: string[] = [];

    for (const item of args.items) {
      // Check for existing item
      const existing = await ctx.db
        .query("feedItems")
        .withIndex("by_external_id", (q) =>
          q.eq("sourceId", item.sourceId).eq("externalId", item.externalId)
        )
        .first();

      if (!existing) {
        const itemId = await ctx.db.insert("feedItems", {
          ...item,
          fetchedAt: Date.now(),
          analyzed: false,
        });
        insertedIds.push(itemId);
      }
    }

    return insertedIds;
  },
});
