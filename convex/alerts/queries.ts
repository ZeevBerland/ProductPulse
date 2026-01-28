import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

// Get alert by ID (internal)
export const getAlert = internalQuery({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get insight by ID (internal)
export const getInsight = internalQuery({
  args: { id: v.id("insights") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get project by ID (internal)
export const getProject = internalQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List active alerts for a project (internal)
export const listActiveAlerts = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return alerts.filter((a) => a.active);
  },
});
