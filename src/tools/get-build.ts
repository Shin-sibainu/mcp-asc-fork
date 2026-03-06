import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BuildsGetInstanceData,
  BuildsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  buildId: z.string().describe("App Store Connect build ID"),
};

export const metadata: ToolMetadata = {
  name: "get-build",
  description: "Get detailed information about a specific build",
  annotations: {
    title: "Get build",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getBuildTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const opts: Pick<BuildsGetInstanceData, "path"> = { path: { id: args.buildId } };
  const result = await client.api.Builds.buildsGetInstance(opts);
  const data = unwrapApiResult<BuildsGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
