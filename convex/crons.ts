import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fetch RSS feeds - runs every 30 minutes but respects per-project intervals
// Projects can be set to: manual (0), 6 hours (360), 12 hours (720), or 24 hours (1440)
crons.interval(
  "fetch-feeds",
  { minutes: 30 },
  internal.feeds.fetch.fetchSourcesWithInterval,
  {}
);

// Analyze unprocessed items every 15 minutes
crons.interval(
  "analyze-items",
  { minutes: 15 },
  internal.analysis.gemini.analyzeUnprocessed,
  {}
);

export default crons;
