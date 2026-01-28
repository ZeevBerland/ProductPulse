/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_suggest from "../ai/suggest.js";
import type * as alerts from "../alerts.js";
import type * as alerts_queries from "../alerts/queries.js";
import type * as alerts_slack from "../alerts/slack.js";
import type * as analysis_gemini from "../analysis/gemini.js";
import type * as crons from "../crons.js";
import type * as feedItems from "../feedItems.js";
import type * as feeds_fetch from "../feeds/fetch.js";
import type * as feeds_mutations from "../feeds/mutations.js";
import type * as feeds_parser from "../feeds/parser.js";
import type * as feeds_queries from "../feeds/queries.js";
import type * as insights from "../insights.js";
import type * as projects from "../projects.js";
import type * as sources from "../sources.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/suggest": typeof ai_suggest;
  alerts: typeof alerts;
  "alerts/queries": typeof alerts_queries;
  "alerts/slack": typeof alerts_slack;
  "analysis/gemini": typeof analysis_gemini;
  crons: typeof crons;
  feedItems: typeof feedItems;
  "feeds/fetch": typeof feeds_fetch;
  "feeds/mutations": typeof feeds_mutations;
  "feeds/parser": typeof feeds_parser;
  "feeds/queries": typeof feeds_queries;
  insights: typeof insights;
  projects: typeof projects;
  sources: typeof sources;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
