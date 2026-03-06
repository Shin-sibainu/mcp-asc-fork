import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionGroupCreateRequest,
  SubscriptionGroupsCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z.string().describe("App ID. The new group will belong to this app."),
  referenceName: z
    .string()
    .describe(
      "Reference name for the subscription group (e.g. Premium). Shown in App Store Connect."
    ),
};

export const metadata: ToolMetadata = {
  name: "create-subscription-group",
  description:
    "Create a subscription group (container for auto-renewable subscriptions). Then add subscriptions with create-subscription.",
  annotations: {
    title: "Create subscription group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createSubscriptionGroupTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: SubscriptionGroupCreateRequest = {
    data: {
      type: "subscriptionGroups",
      attributes: {
        referenceName: args.referenceName,
      },
      relationships: {
        app: {
          data: { type: "apps", id: args.appId },
        },
      },
    },
  };
  const result =
    await client.api.SubscriptionGroups.subscriptionGroupsCreateInstance({
      body,
    });
  const data = unwrapApiResult<SubscriptionGroupsCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
