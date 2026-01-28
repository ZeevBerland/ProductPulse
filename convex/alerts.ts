import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const alertTypeValidator = v.union(
  v.literal("sentiment_drop"),
  v.literal("keyword_mention"),
  v.literal("competitor_mention"),
  v.literal("high_actionability")
);

// List alerts for a project
export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// Get a single alert
export const get = query({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all active alerts (for processing)
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db.query("alerts").collect();
    return alerts.filter((alert) => alert.active);
  },
});

// Create a new alert
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    type: alertTypeValidator,
    conditions: v.object({
      threshold: v.optional(v.number()),
      keywords: v.optional(v.array(v.string())),
    }),
    slackWebhook: v.optional(v.string()),
    emailTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      ...args,
      active: true,
    });
    return alertId;
  },
});

// Update an alert
export const update = mutation({
  args: {
    id: v.id("alerts"),
    name: v.optional(v.string()),
    type: v.optional(alertTypeValidator),
    conditions: v.optional(
      v.object({
        threshold: v.optional(v.number()),
        keywords: v.optional(v.array(v.string())),
      })
    ),
    slackWebhook: v.optional(v.string()),
    emailTo: v.optional(v.string()),
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

// Toggle alert active status
export const toggle = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.id);
    if (!alert) throw new Error("Alert not found");

    await ctx.db.patch(args.id, { active: !alert.active });
    return args.id;
  },
});

// Delete an alert
export const remove = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
