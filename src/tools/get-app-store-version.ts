import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionsGetInstanceData,
  AppStoreVersionsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appStoreVersionId: z
    .string()
    .describe("App Store Connect app store version ID")
};

export const metadata: ToolMetadata = {
  name: "get-app-store-version",
  description:
    "Get detailed information about a specific App Store version (metadata, state, build link)",
  annotations: {
    title: "Get app store version",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getAppStoreVersionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<AppStoreVersionsGetInstanceData, "path"> = {
    path: { id: args.appStoreVersionId },
  };
  const result =
    await client.api.AppStoreVersions.appStoreVersionsGetInstance(opts);
  const data = unwrapApiResult<AppStoreVersionsGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
