import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

// Helper to get authenticated user ID
async function getAuthenticatedUserId(ctx: any) {
  const userId = await auth.getUserId(ctx);
  return userId;
}

// List all projects for the current user (includes legacy projects without userId)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      // Not authenticated - return only legacy projects (for backwards compatibility)
      const legacyProjects = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("userId"), undefined))
        .order("desc")
        .collect();
      return legacyProjects;
    }
    
    // Get user's projects
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    // Also get legacy projects (without userId)
    const legacyProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), undefined))
      .order("desc")
      .collect();
    
    // Combine and sort by createdAt
    const allProjects = [...userProjects, ...legacyProjects];
    allProjects.sort((a, b) => b.createdAt - a.createdAt);
    
    return allProjects;
  },
});

// List all projects with stats (source count, insight count)
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      // Not authenticated - return only legacy projects
      const legacyProjects = await ctx.db
        .query("projects")
        .filter((q) => q.eq(q.field("userId"), undefined))
        .order("desc")
        .collect();
      
      const projectsWithStats = await Promise.all(
        legacyProjects.map(async (project) => {
          const sources = await ctx.db
            .query("sources")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect();
          const insights = await ctx.db
            .query("insights")
            .withIndex("by_project", (q) => q.eq("projectId", project._id))
            .collect();
          return {
            ...project,
            sourceCount: sources.length,
            insightCount: insights.length,
          };
        })
      );
      return projectsWithStats;
    }
    
    // Get user's projects
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    // Also get legacy projects (without userId)
    const legacyProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), undefined))
      .order("desc")
      .collect();
    
    // Combine projects
    const allProjects = [...userProjects, ...legacyProjects];
    allProjects.sort((a, b) => b.createdAt - a.createdAt);
    
    // Get counts for each project
    const projectsWithStats = await Promise.all(
      allProjects.map(async (project) => {
        const sources = await ctx.db
          .query("sources")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        
        const insights = await ctx.db
          .query("insights")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        
        return {
          ...project,
          sourceCount: sources.length,
          insightCount: insights.length,
        };
      })
    );
    
    return projectsWithStats;
  },
});

// Get a single project by ID (verifies ownership)
export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    const project = await ctx.db.get(args.id);
    
    if (!project) return null;
    
    // If user is logged in, verify ownership
    // Allow access to legacy projects (no userId) for backwards compatibility
    if (userId && project.userId && project.userId !== userId) {
      return null;
    }
    
    // If user is not logged in, only allow access to legacy projects
    if (!userId && project.userId) {
      return null;
    }
    
    return project;
  },
});

// Get project with stats (verifies ownership)
export const getWithStats = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    const project = await ctx.db.get(args.id);
    
    if (!project) return null;
    
    // If user is logged in, verify ownership
    // Allow access to legacy projects (no userId) for backwards compatibility
    if (userId && project.userId && project.userId !== userId) {
      return null;
    }
    
    // If user is not logged in, only allow access to legacy projects
    if (!userId && project.userId) {
      return null;
    }

    // Get sources count
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    // Get insights count and sentiment stats
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    insights.forEach((insight) => {
      sentimentCounts[insight.sentimentLabel]++;
    });

    const avgSentiment =
      insights.length > 0
        ? insights.reduce((sum, i) => sum + i.sentimentScore, 0) / insights.length
        : 0;

    return {
      ...project,
      stats: {
        sourcesCount: sources.length,
        activeSourcesCount: sources.filter((s) => s.active).length,
        insightsCount: insights.length,
        sentimentCounts,
        avgSentiment,
      },
    };
  },
});

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const projectId = await ctx.db.insert("projects", {
      userId, // Link to authenticated user
      name: args.name,
      description: args.description,
      keywords: args.keywords,
      createdAt: Date.now(),
    });
    return projectId;
  },
});

// Update a project (verifies ownership)
export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    const { id, ...updates } = args;
    
    // Filter out undefined values
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

// Create a project with sources in one transaction
export const createWithSources = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    sources: v.array(
      v.object({
        type: v.union(
          v.literal("reddit"),
          v.literal("hackernews"),
          v.literal("stackexchange"),
          v.literal("discourse"),
          v.literal("rss")
        ),
        name: v.string(),
        feedUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Create the project
    const projectId = await ctx.db.insert("projects", {
      userId, // Link to authenticated user
      name: args.name,
      description: args.description,
      keywords: args.keywords,
      createdAt: Date.now(),
    });

    // Create all sources
    for (const source of args.sources) {
      await ctx.db.insert("sources", {
        projectId,
        type: source.type,
        name: source.name,
        feedUrl: source.feedUrl,
        active: true,
      });
    }

    return projectId;
  },
});

// Add sources to an existing project (verifies ownership)
export const addSources = mutation({
  args: {
    projectId: v.id("projects"),
    sources: v.array(
      v.object({
        type: v.union(
          v.literal("reddit"),
          v.literal("hackernews"),
          v.literal("stackexchange"),
          v.literal("discourse"),
          v.literal("rss")
        ),
        name: v.string(),
        feedUrl: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const createdIds = [];
    for (const source of args.sources) {
      const id = await ctx.db.insert("sources", {
        projectId: args.projectId,
        type: source.type,
        name: source.name,
        feedUrl: source.feedUrl,
        active: true,
      });
      createdIds.push(id);
    }

    return createdIds;
  },
});

// Update fetch interval for a project (verifies ownership)
export const updateFetchInterval = mutation({
  args: {
    id: v.id("projects"),
    fetchInterval: v.number(), // minutes (0 = manual only)
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    await ctx.db.patch(args.id, { fetchInterval: args.fetchInterval });
    return args.id;
  },
});

// Set fetch status for a project (verifies ownership)
export const setFetchStatus = mutation({
  args: {
    id: v.id("projects"),
    status: v.union(v.literal("idle"), v.literal("fetching"), v.literal("stopping")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    await ctx.db.patch(args.id, { fetchStatus: args.status });
    return args.id;
  },
});

// Request to stop fetching for a project (verifies ownership)
export const requestStopFetch = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    // Only set to stopping if currently fetching
    if (project.fetchStatus === "fetching") {
      await ctx.db.patch(args.id, { fetchStatus: "stopping" });
      return { success: true, message: "Stop requested" };
    }
    
    return { success: false, message: "Not currently fetching" };
  },
});

// Add a competitor to a project (verifies ownership)
export const addCompetitor = mutation({
  args: {
    projectId: v.id("projects"),
    competitor: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const competitors = project.competitors || [];
    const competitorLower = args.competitor.toLowerCase().trim();
    
    if (!competitors.includes(competitorLower)) {
      await ctx.db.patch(args.projectId, {
        competitors: [...competitors, competitorLower],
      });
    }

    return args.projectId;
  },
});

// Remove a competitor from a project (verifies ownership)
export const removeCompetitor = mutation({
  args: {
    projectId: v.id("projects"),
    competitor: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    const competitors = project.competitors || [];
    const competitorLower = args.competitor.toLowerCase().trim();
    
    await ctx.db.patch(args.projectId, {
      competitors: competitors.filter((c) => c !== competitorLower),
    });

    return args.projectId;
  },
});

// Set multiple competitors for a project (verifies ownership)
export const setCompetitors = mutation({
  args: {
    projectId: v.id("projects"),
    competitors: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }

    await ctx.db.patch(args.projectId, {
      competitors: args.competitors.map((c) => c.toLowerCase().trim()),
    });

    return args.projectId;
  },
});

// Delete a project and all related data (verifies ownership)
export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthenticatedUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    // Delete all insights for this project
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    
    for (const insight of insights) {
      await ctx.db.delete(insight._id);
    }

    // Delete all alerts for this project
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    
    for (const alert of alerts) {
      await ctx.db.delete(alert._id);
    }

    // Get all sources and their feed items
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const source of sources) {
      // Delete feed items for this source
      const feedItems = await ctx.db
        .query("feedItems")
        .withIndex("by_source", (q) => q.eq("sourceId", source._id))
        .collect();
      
      for (const item of feedItems) {
        await ctx.db.delete(item._id);
      }
      
      // Delete the source
      await ctx.db.delete(source._id);
    }

    // Finally, delete the project
    await ctx.db.delete(args.id);
    return args.id;
  },
});
