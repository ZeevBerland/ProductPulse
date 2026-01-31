import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

// Get a single source by ID (internal)
export const getSource = internalQuery({
  args: { id: v.id("sources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List all active sources (internal)
export const listActiveSources = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sources")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

// Get unanalyzed feed items (internal)
export const getUnanalyzedItems = internalQuery({
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

// Get feed item by ID (internal)
export const getFeedItem = internalQuery({
  args: { id: v.id("feedItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Check if feed item exists (internal)
export const feedItemExists = internalQuery({
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

// Get active sources with their project's fetch interval (internal)
export const listActiveSourcesWithInterval = internalQuery({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    // Get project fetch intervals
    const sourcesWithInterval = await Promise.all(
      sources.map(async (source) => {
        const project = await ctx.db.get(source.projectId);
        return {
          ...source,
          projectFetchInterval: project?.fetchInterval ?? 15, // Default 15 minutes
        };
      })
    );

    return sourcesWithInterval;
  },
});

// Get project by ID (internal - used for keyword filtering during analysis)
export const getProject = internalQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get unanalyzed feed items for a specific project (internal)
export const getUnanalyzedItemsForProject = internalQuery({
  args: { 
    projectId: v.id("projects"),
    limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    // Get all sources for this project
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    const sourceIds = sources.map(s => s._id);
    
    // Get unanalyzed items for these sources
    const allUnanalyzed = await ctx.db
      .query("feedItems")
      .withIndex("by_analyzed", (q) => q.eq("analyzed", false))
      .order("desc")
      .collect();
    
    // Filter to only items from this project's sources
    const projectItems = allUnanalyzed.filter(item => 
      sourceIds.some(id => id === item.sourceId)
    );
    
    if (args.limit) {
      return projectItems.slice(0, args.limit);
    }
    return projectItems;
  },
});
