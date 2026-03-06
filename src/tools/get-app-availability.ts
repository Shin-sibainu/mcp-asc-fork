import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsAppAvailabilityV2GetToOneRelatedData,
  AppsAppAvailabilityV2GetToOneRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z.string().describe("App ID. Availability defines which territories the app is in."),
};

export const metadata: ToolMetadata = {
  name: "get-app-availability",
  description:
    "Get app availability (territories where the app is available). Use list-territories for territory list.",
  annotations: {
    title: "Get app availability",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getAppAvailabilityTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const result =
    await client.api.Apps.appsAppAvailabilityV2GetToOneRelated({
      path: { id: args.appId },
    } as AppsAppAvailabilityV2GetToOneRelatedData);
  const data =
    unwrapApiResult<AppsAppAvailabilityV2GetToOneRelatedResponse>(result);
  return JSON.stringify(data, null, 2);
}
