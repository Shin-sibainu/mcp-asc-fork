import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BundleIdsGetInstanceData,
  BundleIdsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  bundleIdId: z.string().describe("App Store Connect bundle ID resource ID")
};

export const metadata: ToolMetadata = {
  name: "get-bundle-id",
  description: "Get detailed information about a specific bundle ID",
  annotations: {
    title: "Get bundle ID",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getBundleIdTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<BundleIdsGetInstanceData, "path"> = {
    path: { id: args.bundleIdId },
  };
  const result = await client.api.BundleIds.bundleIdsGetInstance(opts);
  const data = unwrapApiResult<BundleIdsGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
