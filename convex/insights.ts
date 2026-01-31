import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const sentimentLabelValidator = v.union(
  v.literal("positive"),
  v.literal("negative"),
  v.literal("neutral")
);

const actionabilityValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low")
);

// List insights for a project with optional filters
export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    sentimentFilter: v.optional(sentimentLabelValidator),
    themeFilter: v.optional(v.string()),
    minRelevance: v.optional(v.number()), // 0 to 1 - minimum relevance score
    competitorFilter: v.optional(v.string()), // Filter by competitor mention in entities
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("insights")
      .withIndex("by_project_date", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // Apply filters
    if (args.sentimentFilter) {
      results = results.filter((i) => i.sentimentLabel === args.sentimentFilter);
    }
    if (args.themeFilter !== undefined) {
      const themeToFilter = args.themeFilter;
      results = results.filter((i) => i.themes.includes(themeToFilter));
    }
    if (args.minRelevance !== undefined && args.minRelevance > 0) {
      const minScore = args.minRelevance;
      results = results.filter((i) => (i.relevanceScore ?? 1) >= minScore);
    }
    if (args.competitorFilter) {
      const competitor = args.competitorFilter.toLowerCase();
      results = results.filter((i) => 
        i.entities.some((e) => e.toLowerCase().includes(competitor))
      );
    }

    // Apply limit
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

// Get insights for a specific feed item
export const getByFeedItem = query({
  args: { feedItemId: v.id("feedItems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_feedItem", (q) => q.eq("feedItemId", args.feedItemId))
      .first();
  },
});

// Get sentiment statistics for a project
export const getStats = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoff = args.daysBack
      ? Date.now() - args.daysBack * 24 * 60 * 60 * 1000
      : 0;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = cutoff
      ? insights.filter((i) => i.analyzedAt >= cutoff)
      : insights;

    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const themeCounts: Record<string, number> = {};
    const entityCounts: Record<string, number> = {};
    let totalSentiment = 0;

    for (const insight of filteredInsights) {
      sentimentCounts[insight.sentimentLabel]++;
      totalSentiment += insight.sentimentScore;

      for (const theme of insight.themes) {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
      }
      for (const entity of insight.entities) {
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;
      }
    }

    const avgSentiment =
      filteredInsights.length > 0 ? totalSentiment / filteredInsights.length : 0;

    // Sort themes and entities by count
    const topThemes = Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const topEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalInsights: filteredInsights.length,
      sentimentCounts,
      avgSentiment,
      topThemes,
      topEntities,
      highActionability: filteredInsights.filter(
        (i) => i.actionability === "high"
      ).length,
    };
  },
});

// Get dashboard-wide stats across all user's projects
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    // Get all projects (including legacy ones)
    const allProjects = await ctx.db.query("projects").collect();
    
    if (allProjects.length === 0) {
      return {
        totalSources: 0,
        activeSources: 0,
        totalInsights: 0,
        avgSentiment: 0,
      };
    }

    // Get all sources for these projects
    let totalSources = 0;
    let activeSources = 0;
    let totalInsights = 0;
    let totalSentiment = 0;
    let insightCount = 0;

    for (const project of allProjects) {
      const sources = await ctx.db
        .query("sources")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      
      totalSources += sources.length;
      activeSources += sources.filter(s => s.active).length;

      const insights = await ctx.db
        .query("insights")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect();
      
      totalInsights += insights.length;
      for (const insight of insights) {
        totalSentiment += insight.sentimentScore;
        insightCount++;
      }
    }

    const avgSentiment = insightCount > 0 ? totalSentiment / insightCount : 0;

    return {
      totalSources,
      activeSources,
      totalInsights,
      avgSentiment,
    };
  },
});

// Get sentiment trend over time
export const getSentimentTrend = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysBack || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project_date", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = insights.filter((i) => i.analyzedAt >= cutoff);

    // Group by day
    const dailyData: Record<
      string,
      { date: string; positive: number; negative: number; neutral: number; avg: number; count: number }
    > = {};

    for (const insight of filteredInsights) {
      const date = new Date(insight.analyzedAt).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          positive: 0,
          negative: 0,
          neutral: 0,
          avg: 0,
          count: 0,
        };
      }
      dailyData[date][insight.sentimentLabel]++;
      dailyData[date].avg += insight.sentimentScore;
      dailyData[date].count++;
    }

    // Calculate averages and sort by date
    const trend = Object.values(dailyData)
      .map((day) => ({
        ...day,
        avg: day.count > 0 ? day.avg / day.count : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trend;
  },
});

// Create a new insight
export const create = mutation({
  args: {
    feedItemId: v.id("feedItems"),
    projectId: v.id("projects"),
    sourceId: v.id("sources"),
    sentimentScore: v.number(),
    sentimentLabel: sentimentLabelValidator,
    entities: v.array(v.string()),
    themes: v.array(v.string()),
    summary: v.string(),
    actionability: actionabilityValidator,
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

// Get recent high-actionability insights
export const getHighActionability = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project_date", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    const filtered = insights.filter((i) => i.actionability === "high");
    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

// ============================================
// DEEP ANALYTICS QUERIES
// ============================================

// Get volume trend (daily insight counts with moving average data)
export const getVolumeTrend = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysBack || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = insights.filter((i) => i.analyzedAt >= cutoff);

    // Group by day
    const dailyCounts: Record<string, number> = {};

    for (const insight of filteredInsights) {
      const date = new Date(insight.analyzedAt).toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }

    // Fill in missing days with 0
    const allDays: { date: string; count: number }[] = [];
    const startDate = new Date(cutoff);
    const endDate = new Date();

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      allDays.push({
        date: dateStr,
        count: dailyCounts[dateStr] || 0,
      });
    }

    // Calculate 7-day moving average
    const result = allDays.map((day, index) => {
      const windowStart = Math.max(0, index - 6);
      const window = allDays.slice(windowStart, index + 1);
      const movingAvg = window.reduce((sum, d) => sum + d.count, 0) / window.length;

      return {
        date: day.date,
        count: day.count,
        movingAvg: Math.round(movingAvg * 100) / 100,
      };
    });

    return result;
  },
});

// Get competitor mentions analysis
export const getCompetitorMentions = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysBack || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get project to access competitors list
    const project = await ctx.db.get(args.projectId);
    if (!project) return { competitors: [], trends: [] };

    const trackedCompetitors = project.competitors || [];
    if (trackedCompetitors.length === 0) {
      return { competitors: [], trends: [] };
    }

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = insights.filter((i) => i.analyzedAt >= cutoff);

    // Count mentions and sentiment per competitor
    const competitorStats: Record<string, { 
      name: string; 
      mentions: number; 
      totalSentiment: number;
      positive: number;
      negative: number;
      neutral: number;
    }> = {};

    // Initialize stats for all tracked competitors
    for (const comp of trackedCompetitors) {
      competitorStats[comp.toLowerCase()] = {
        name: comp,
        mentions: 0,
        totalSentiment: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
      };
    }

    // Analyze entities in insights
    for (const insight of filteredInsights) {
      for (const entity of insight.entities) {
        const entityLower = entity.toLowerCase();
        for (const comp of trackedCompetitors) {
          if (entityLower.includes(comp.toLowerCase()) || comp.toLowerCase().includes(entityLower)) {
            const stats = competitorStats[comp.toLowerCase()];
            stats.mentions++;
            stats.totalSentiment += insight.sentimentScore;
            stats[insight.sentimentLabel]++;
          }
        }
      }
    }

    // Build competitor summary
    const competitors = Object.values(competitorStats)
      .filter((c) => c.mentions > 0)
      .map((c) => ({
        name: c.name,
        mentions: c.mentions,
        avgSentiment: c.mentions > 0 ? Math.round((c.totalSentiment / c.mentions) * 100) / 100 : 0,
        positive: c.positive,
        negative: c.negative,
        neutral: c.neutral,
      }))
      .sort((a, b) => b.mentions - a.mentions);

    // Build daily trends for top 5 competitors
    const topCompetitors = competitors.slice(0, 5).map((c) => c.name.toLowerCase());
    const dailyTrends: Record<string, Record<string, number>> = {};

    for (const insight of filteredInsights) {
      const date = new Date(insight.analyzedAt).toISOString().split("T")[0];
      if (!dailyTrends[date]) {
        dailyTrends[date] = {};
        for (const comp of topCompetitors) {
          dailyTrends[date][comp] = 0;
        }
      }

      for (const entity of insight.entities) {
        const entityLower = entity.toLowerCase();
        for (const comp of topCompetitors) {
          if (entityLower.includes(comp) || comp.includes(entityLower)) {
            dailyTrends[date][comp]++;
          }
        }
      }
    }

    const trends = Object.entries(dailyTrends)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { competitors, trends };
  },
});

// Get theme trends over time
export const getThemeTrends = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
    topN: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysBack || 30;
    const topN = args.topN || 5;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = insights.filter((i) => i.analyzedAt >= cutoff);

    // Count total mentions per theme
    const themeTotals: Record<string, number> = {};
    for (const insight of filteredInsights) {
      for (const theme of insight.themes) {
        themeTotals[theme] = (themeTotals[theme] || 0) + 1;
      }
    }

    // Get top N themes
    const topThemes = Object.entries(themeTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name]) => name);

    // Build daily trends
    const dailyData: Record<string, Record<string, number>> = {};

    for (const insight of filteredInsights) {
      const date = new Date(insight.analyzedAt).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = {};
        for (const theme of topThemes) {
          dailyData[date][theme] = 0;
        }
      }

      for (const theme of insight.themes) {
        if (topThemes.includes(theme)) {
          dailyData[date][theme]++;
        }
      }
    }

    const trends = Object.entries(dailyData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate theme growth (compare last 7 days to previous 7 days)
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

    const recentInsights = filteredInsights.filter((i) => i.analyzedAt >= oneWeekAgo);
    const previousInsights = filteredInsights.filter(
      (i) => i.analyzedAt >= twoWeeksAgo && i.analyzedAt < oneWeekAgo
    );

    const themeGrowth = topThemes.map((theme) => {
      const recentCount = recentInsights.filter((i) => i.themes.includes(theme)).length;
      const previousCount = previousInsights.filter((i) => i.themes.includes(theme)).length;
      const growth = previousCount > 0 
        ? Math.round(((recentCount - previousCount) / previousCount) * 100)
        : recentCount > 0 ? 100 : 0;

      return { theme, recentCount, previousCount, growth };
    });

    // Detect emerging themes (appeared in last 7 days but not before)
    const allThemesRecent = new Set<string>();
    const allThemesPrevious = new Set<string>();

    for (const insight of recentInsights) {
      insight.themes.forEach((t) => allThemesRecent.add(t));
    }
    for (const insight of filteredInsights.filter((i) => i.analyzedAt < oneWeekAgo)) {
      insight.themes.forEach((t) => allThemesPrevious.add(t));
    }

    const emergingThemes = [...allThemesRecent]
      .filter((t) => !allThemesPrevious.has(t))
      .map((theme) => ({
        theme,
        count: recentInsights.filter((i) => i.themes.includes(theme)).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topThemes, trends, themeGrowth, emergingThemes };
  },
});

// Get source performance stats
export const getSourceStats = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysBack || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    // Get all sources for this project
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = insights.filter((i) => i.analyzedAt >= cutoff);

    // Build stats per source
    const sourceStats = sources.map((source) => {
      const sourceInsights = filteredInsights.filter((i) => i.sourceId === source._id);
      const totalSentiment = sourceInsights.reduce((sum, i) => sum + i.sentimentScore, 0);
      const avgSentiment = sourceInsights.length > 0 
        ? Math.round((totalSentiment / sourceInsights.length) * 100) / 100
        : 0;

      const sentimentCounts = {
        positive: sourceInsights.filter((i) => i.sentimentLabel === "positive").length,
        negative: sourceInsights.filter((i) => i.sentimentLabel === "negative").length,
        neutral: sourceInsights.filter((i) => i.sentimentLabel === "neutral").length,
      };

      const actionabilityCounts = {
        high: sourceInsights.filter((i) => i.actionability === "high").length,
        medium: sourceInsights.filter((i) => i.actionability === "medium").length,
        low: sourceInsights.filter((i) => i.actionability === "low").length,
      };

      return {
        sourceId: source._id,
        name: source.name,
        type: source.type,
        insightCount: sourceInsights.length,
        avgSentiment,
        sentimentCounts,
        actionabilityCounts,
        active: source.active,
      };
    });

    // Sort by insight count
    sourceStats.sort((a, b) => b.insightCount - a.insightCount);

    return sourceStats;
  },
});

// Get actionability distribution and trends
export const getActionabilityStats = query({
  args: {
    projectId: v.id("projects"),
    daysBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.daysBack || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const insights = await ctx.db
      .query("insights")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const filteredInsights = insights.filter((i) => i.analyzedAt >= cutoff);

    // Overall distribution
    const distribution = {
      high: filteredInsights.filter((i) => i.actionability === "high").length,
      medium: filteredInsights.filter((i) => i.actionability === "medium").length,
      low: filteredInsights.filter((i) => i.actionability === "low").length,
    };

    // Daily trend
    const dailyData: Record<string, { high: number; medium: number; low: number }> = {};

    for (const insight of filteredInsights) {
      const date = new Date(insight.analyzedAt).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { high: 0, medium: 0, low: 0 };
      }
      dailyData[date][insight.actionability]++;
    }

    const trend = Object.entries(dailyData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // High-priority themes breakdown
    const highActionabilityInsights = filteredInsights.filter((i) => i.actionability === "high");
    const highPriorityThemes: Record<string, number> = {};

    for (const insight of highActionabilityInsights) {
      for (const theme of insight.themes) {
        highPriorityThemes[theme] = (highPriorityThemes[theme] || 0) + 1;
      }
    }

    const topHighPriorityThemes = Object.entries(highPriorityThemes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    return { distribution, trend, topHighPriorityThemes };
  },
});
