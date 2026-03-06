import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { AppsGetInstanceResponse } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { getAppIncludeOptions, type GetAppOptions } from "../lib/api-types.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z.string().describe('App Store Connect app ID'),
  include: z
    .array(z.enum(getAppIncludeOptions))
    .optional()
    .describe(
      'Relationships to include (e.g. appStoreVersions, betaGroups, builds)'
    ),
};

export const metadata: ToolMetadata = {
  name: 'get-app',
  description: 'Get detailed information about a specific app',
  annotations: {
    title: 'Get app',
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
}

export default async function getAppTool(args: InferSchema<typeof schema>) {
  const client = getClient()
  const opts: GetAppOptions = {
    path: { id: args.appId },
    ...(args.include?.length && { query: { include: args.include } }),
  }
  const result = await client.api.Apps.appsGetInstance(opts);
  const data = unwrapApiResult<AppsGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
