import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionsGetInstanceData,
  SubscriptionsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  subscriptionId: z
    .string()
    .describe(
      "Subscription ID (from list-subscription-group-subscriptions or app subscription groups)"
    ),
};

export const metadata: ToolMetadata = {
  name: "get-subscription",
  description:
    "Get one subscription by ID: productId, name, state, prices, review screenshot, introductory/promotional offers, etc.",
  annotations: {
    title: "Get subscription",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getSubscriptionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<SubscriptionsGetInstanceData, "path"> = {
    path: { id: args.subscriptionId },
  };
  const result = await client.api.Subscriptions.subscriptionsGetInstance(opts);
  const data = unwrapApiResult<SubscriptionsGetInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
