import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsAppPricePointsGetToManyRelatedData,
  AppPricePointsV3Response,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  appId: z
    .string()
    .describe("App ID (from list-apps)"),
  "filter.territory": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe(
      "Filter by territory ID(s) (e.g. JPN, USA). Strongly recommended to avoid huge response."
    ),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of price points to return (default 50, max 200)"),
  include: z
    .array(z.enum(["app", "territory"]))
    .optional()
    .describe("Related resources to include (app, territory)"),
};

export const metadata: ToolMetadata = {
  name: "list-app-price-points",
  description:
    "List available price points for an app (not subscriptions). Use the returned price point IDs with create-app-price-schedule. Filter by territory to get manageable results. Price point with customerPrice '0' = free.",
  annotations: {
    title: "List app price points",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppPricePointsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<
    AppsAppPricePointsGetToManyRelatedData,
    "path" | "query"
  > = {
    path: { id: args.appId },
    query: {
      limit: args.limit,
      ...(toArray(args["filter.territory"])?.length && {
        "filter[territory]": toArray(args["filter.territory"])!,
      }),
      ...(args.include?.length && {
        include: args.include,
      }),
    },
  };
  const result =
    await client.api.Apps.appsAppPricePointsGetToManyRelated(opts);
  const data = unwrapApiResult<AppPricePointsV3Response>(result);
  return JSON.stringify(data, null, 2);
}
