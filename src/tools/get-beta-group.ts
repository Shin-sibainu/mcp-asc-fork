import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaGroupsGetInstanceData,
  BetaGroupsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  betaGroupId: z.string().describe("App Store Connect beta group ID")
};

export const metadata: ToolMetadata = {
  name: "get-beta-group",
  description: "Get detailed information about a specific beta group",
  annotations: {
    title: "Get beta group",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getBetaGroupTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<BetaGroupsGetInstanceData, "path"> = {
    path: { id: args.betaGroupId },
  };
  const result = await client.api.BetaGroups.betaGroupsGetInstance(opts);
  const data = unwrapApiResult<BetaGroupsGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
