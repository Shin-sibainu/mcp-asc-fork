import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsAppInfosGetToManyRelatedData,
  AppsAppInfosGetToManyRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z.string().describe("App ID. App infos are per territory (age rating, etc.)."),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of app infos to return"),
};

export const metadata: ToolMetadata = {
  name: "list-app-infos",
  description:
    "List app infos for an app (one per territory): age rating, app store state, category. Use get-app-info for a single territory.",
  annotations: {
    title: "List app infos",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppInfosTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const result = await client.api.Apps.appsAppInfosGetToManyRelated({
    path: { id: args.appId },
    query: { limit: args.limit },
  } as AppsAppInfosGetToManyRelatedData);
  const data = unwrapApiResult<AppsAppInfosGetToManyRelatedResponse>(result);
  return JSON.stringify(data, null, 2);
}
