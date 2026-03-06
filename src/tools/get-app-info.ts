import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppInfosGetInstanceData,
  AppInfosGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appInfoId: z
    .string()
    .describe("App info ID (from list-app-infos; one per territory)"),
};

export const metadata: ToolMetadata = {
  name: "get-app-info",
  description:
    "Get app info for one territory: age rating, category, app store state. IDs from list-app-infos.",
  annotations: {
    title: "Get app info",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getAppInfoTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const opts: Pick<AppInfosGetInstanceData, "path"> = {
    path: { id: args.appInfoId },
  };
  const result = await client.api.AppInfos.appInfosGetInstance(opts);
  const data = unwrapApiResult<AppInfosGetInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
