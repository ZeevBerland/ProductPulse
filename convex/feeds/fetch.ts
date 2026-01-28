"use node";

import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { fetchFeed } from "./parser";

// Result types
type FetchResult = { success: boolean; itemsAdded: number; error?: string };
type FetchAllResult = { total: number; successful: number; itemsAdded: number };

// Fetch a single source's RSS feed
export const fetchSource = internalAction({
  args: {
    sourceId: v.id("sources"),
  },
  handler: async (ctx, args): Promise<FetchResult> => {
    // Get the source
    const source = await ctx.runQuery(internal.feeds.queries.getSource, {
      id: args.sourceId,
    });

    if (!source) {
      return { success: false, itemsAdded: 0, error: "Source not found" };
    }

    if (!source.active) {
      return { success: false, itemsAdded: 0, error: "Source is not active" };
    }

    try {
      // Fetch and parse the feed
      const feed = await fetchFeed(source.feedUrl);

      // Insert new items
      let itemsAdded = 0;
      for (const item of feed.items) {
        const wasInserted = await ctx.runMutation(internal.feeds.mutations.insertFeedItem, {
          sourceId: args.sourceId,
          externalId: item.id,
          title: item.title,
          content: item.content,
          url: item.link,
          author: item.author,
          publishedAt: item.pubDate.getTime(),
        });

        if (wasInserted) {
          itemsAdded++;
        }
      }

      // Update last fetched timestamp
      await ctx.runMutation(internal.feeds.mutations.updateSourceLastFetched, {
        sourceId: args.sourceId,
      });

      return { success: true, itemsAdded };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error fetching source ${args.sourceId}:`, errorMessage);
      return { success: false, itemsAdded: 0, error: errorMessage };
    }
  },
});

// Helper to add delay between requests
const delayInternal = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all active sources (ignores per-project intervals)
export const fetchAllSources = internalAction({
  args: {},
  handler: async (ctx): Promise<FetchAllResult> => {
    // Get all active sources
    const sources = await ctx.runQuery(internal.feeds.queries.listActiveSources, {});

    let successful = 0;
    let totalItemsAdded = 0;

    // Separate Reddit sources from others
    const redditSources = sources.filter(s => s.feedUrl.includes("reddit.com"));
    const otherSources = sources.filter(s => !s.feedUrl.includes("reddit.com"));

    // Fetch non-Reddit sources first
    for (let i = 0; i < otherSources.length; i++) {
      const source = otherSources[i];
      if (i > 0) await delayInternal(1000);

      const result = await ctx.runAction(internal.feeds.fetch.fetchSource, {
        sourceId: source._id,
      });

      if (result.success) {
        successful++;
        totalItemsAdded += result.itemsAdded;
      }
    }

    // Fetch Reddit sources with longer delays
    for (let i = 0; i < redditSources.length; i++) {
      const source = redditSources[i];
      await delayInternal(5000); // 5 seconds between Reddit

      const result = await ctx.runAction(internal.feeds.fetch.fetchSource, {
        sourceId: source._id,
      });

      if (result.success) {
        successful++;
        totalItemsAdded += result.itemsAdded;
      }
    }

    return {
      total: sources.length,
      successful,
      itemsAdded: totalItemsAdded,
    };
  },
});

// Fetch sources respecting per-project fetch intervals
export const fetchSourcesWithInterval = internalAction({
  args: {},
  handler: async (ctx): Promise<FetchAllResult> => {
    // Get all active sources with their project's fetch interval
    const sources = await ctx.runQuery(
      internal.feeds.queries.listActiveSourcesWithInterval,
      {}
    );

    const now = Date.now();
    let successful = 0;
    let totalItemsAdded = 0;
    let fetchedCount = 0;

    // Filter sources that are due for fetching
    const dueSources = sources.filter(source => {
      if (source.projectFetchInterval === 0) return false;
      const intervalMs = source.projectFetchInterval * 60 * 1000;
      const lastFetched = source.lastFetched || 0;
      return (now - lastFetched) >= intervalMs;
    });

    // Separate Reddit from others
    const redditSources = dueSources.filter(s => s.feedUrl.includes("reddit.com"));
    const otherSources = dueSources.filter(s => !s.feedUrl.includes("reddit.com"));

    // Fetch non-Reddit sources first
    for (let i = 0; i < otherSources.length; i++) {
      const source = otherSources[i];
      if (i > 0) await delayInternal(1000);

      fetchedCount++;
      const result = await ctx.runAction(internal.feeds.fetch.fetchSource, {
        sourceId: source._id,
      });

      if (result.success) {
        successful++;
        totalItemsAdded += result.itemsAdded;
      }
    }

    // Fetch Reddit sources with longer delays
    for (let i = 0; i < redditSources.length; i++) {
      const source = redditSources[i];
      await delayInternal(5000);

      fetchedCount++;
      const result = await ctx.runAction(internal.feeds.fetch.fetchSource, {
        sourceId: source._id,
      });

      if (result.success) {
        successful++;
        totalItemsAdded += result.itemsAdded;
      }
    }

    return {
      total: fetchedCount,
      successful,
      itemsAdded: totalItemsAdded,
    };
  },
});

// Public action to manually trigger a source fetch
export const triggerFetch = action({
  args: {
    sourceId: v.id("sources"),
  },
  returns: v.object({
    success: v.boolean(),
    itemsAdded: v.number(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<FetchResult> => {
    return await ctx.runAction(internal.feeds.fetch.fetchSource, {
      sourceId: args.sourceId,
    });
  },
});

// Public action to manually trigger fetching all sources
export const triggerFetchAll = action({
  args: {},
  returns: v.object({
    total: v.number(),
    successful: v.number(),
    itemsAdded: v.number(),
  }),
  handler: async (ctx): Promise<FetchAllResult> => {
    return await ctx.runAction(internal.feeds.fetch.fetchAllSources, {});
  },
});

// Helper to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Public action to fetch all sources for a specific project
export const triggerFetchProject = action({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.object({
    total: v.number(),
    successful: v.number(),
    itemsAdded: v.number(),
    errors: v.array(v.string()),
    stopped: v.boolean(),
  }),
  handler: async (ctx, args): Promise<FetchAllResult & { errors: string[]; stopped: boolean }> => {
    // Set fetch status to "fetching"
    await ctx.runMutation(internal.feeds.mutations.setProjectFetchStatus, {
      projectId: args.projectId,
      status: "fetching",
    });

    // Get all active sources for this project
    const sources = await ctx.runQuery(internal.feeds.queries.listActiveSources, {});
    const projectSources = sources.filter((s) => s.projectId === args.projectId);

    let successful = 0;
    let totalItemsAdded = 0;
    const errors: string[] = [];
    let stopped = false;

    // Helper to check if we should stop
    const shouldStop = async () => {
      const project = await ctx.runQuery(internal.feeds.queries.getProject, {
        id: args.projectId,
      });
      return project?.fetchStatus === "stopping";
    };

    // Separate Reddit sources from others (Reddit needs longer delays)
    const redditSources = projectSources.filter(s => s.feedUrl.includes("reddit.com"));
    const otherSources = projectSources.filter(s => !s.feedUrl.includes("reddit.com"));

    // Fetch non-Reddit sources first (faster)
    for (let i = 0; i < otherSources.length; i++) {
      // Check if stop was requested
      if (await shouldStop()) {
        stopped = true;
        break;
      }

      const source = otherSources[i];
      
      if (i > 0) {
        await delay(1000); // 1 second between non-Reddit sources
      }

      const result = await ctx.runAction(internal.feeds.fetch.fetchSource, {
        sourceId: source._id,
      });

      if (result.success) {
        successful++;
        totalItemsAdded += result.itemsAdded;
      } else if (result.error) {
        errors.push(`${source.name}: ${result.error}`);
      }
    }

    // Fetch Reddit sources with longer delays (only if not stopped)
    if (!stopped) {
      for (let i = 0; i < redditSources.length; i++) {
        // Check if stop was requested
        if (await shouldStop()) {
          stopped = true;
          break;
        }

        const source = redditSources[i];
        
        // 5 seconds between Reddit sources to avoid rate limiting
        await delay(5000);

        const result = await ctx.runAction(internal.feeds.fetch.fetchSource, {
          sourceId: source._id,
        });

        if (result.success) {
          successful++;
          totalItemsAdded += result.itemsAdded;
        } else if (result.error) {
          errors.push(`${source.name}: ${result.error}`);
        }
      }
    }

    // Set fetch status back to "idle"
    await ctx.runMutation(internal.feeds.mutations.setProjectFetchStatus, {
      projectId: args.projectId,
      status: "idle",
    });

    return {
      total: projectSources.length,
      successful,
      itemsAdded: totalItemsAdded,
      errors,
      stopped,
    };
  },
});
