import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    competitors: v.optional(v.array(v.string())), // Tracked competitors (separate from keywords)
    fetchInterval: v.optional(v.number()), // Minutes between fetches (default: 15, 0 = manual only)
    fetchStatus: v.optional(v.union(
      v.literal("idle"),
      v.literal("fetching"),
      v.literal("stopping")
    )), // Current fetch status for stop functionality
    createdAt: v.number(),
  }),

  sources: defineTable({
    projectId: v.id("projects"),
    type: v.union(
      v.literal("reddit"),
      v.literal("hackernews"),
      v.literal("stackexchange"),
      v.literal("discourse"),
      v.literal("rss")
    ),
    name: v.string(),
    feedUrl: v.string(),
    active: v.boolean(),
    lastFetched: v.optional(v.number()),
    config: v.optional(v.any()), // Additional source-specific config
  })
    .index("by_project", ["projectId"])
    .index("by_active", ["active"]),

  feedItems: defineTable({
    sourceId: v.id("sources"),
    externalId: v.string(),
    title: v.string(),
    content: v.string(),
    url: v.string(),
    author: v.optional(v.string()),
    publishedAt: v.number(),
    fetchedAt: v.number(),
    analyzed: v.boolean(),
  })
    .index("by_source", ["sourceId"])
    .index("by_analyzed", ["analyzed"])
    .index("by_external_id", ["sourceId", "externalId"]),

  insights: defineTable({
    feedItemId: v.id("feedItems"),
    projectId: v.id("projects"),
    sourceId: v.id("sources"),
    sentimentScore: v.number(), // -1 to 1
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
    analyzedAt: v.number(),
    // Denormalized fields for easier querying
    feedItemTitle: v.string(),
    feedItemUrl: v.string(),
    feedItemPublishedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_date", ["projectId", "analyzedAt"])
    .index("by_feedItem", ["feedItemId"])
    .index("by_sentiment", ["projectId", "sentimentLabel"]),

  alerts: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    type: v.union(
      v.literal("sentiment_drop"),
      v.literal("keyword_mention"),
      v.literal("competitor_mention"),
      v.literal("high_actionability")
    ),
    conditions: v.object({
      threshold: v.optional(v.number()),
      keywords: v.optional(v.array(v.string())),
    }),
    slackWebhook: v.optional(v.string()),
    emailTo: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_project", ["projectId"]),
});
