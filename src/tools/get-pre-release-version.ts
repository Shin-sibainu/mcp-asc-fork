import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  PreReleaseVersionsGetInstanceData,
  PreReleaseVersionsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  preReleaseVersionId: z
    .string()
    .describe("App Store Connect pre-release version ID")
};

export const metadata: ToolMetadata = {
  name: "get-pre-release-version",
  description:
    "Get detailed information about a specific pre-release (TestFlight) version",
  annotations: {
    title: "Get pre-release version",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getPreReleaseVersionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<PreReleaseVersionsGetInstanceData, "path"> = {
    path: { id: args.preReleaseVersionId },
  };
  const result =
    await client.api.PreReleaseVersions.preReleaseVersionsGetInstance(opts);
  const data = unwrapApiResult<PreReleaseVersionsGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
