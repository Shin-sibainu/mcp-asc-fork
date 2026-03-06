import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionAvailabilityCreateRequest,
  SubscriptionAvailabilitiesCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  subscriptionId: z
    .string()
    .describe(
      "Subscription ID (from create-subscription or list-subscription-group-subscriptions)"
    ),
  territoryIds: z
    .union([z.string(), z.array(z.string())])
    .describe(
      "Territory ID(s) where the subscription is for sale (e.g. USA). Use list-territories to get IDs. Required before adding prices with create-subscription-price."
    ),
  availableInNewTerritories: z
    .boolean()
    .default(true)
    .describe(
      "If true, the subscription becomes available in new territories Apple adds in the future. Default true."
    ),
};

export const metadata: ToolMetadata = {
  name: "create-subscription-availability",
  description:
    "Set which territories the subscription is available in. Call this before create-subscription-price; otherwise adding a price often returns 409 ENTITY_ERROR.RELATIONSHIP.INVALID.",
  annotations: {
    title: "Create subscription availability",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createSubscriptionAvailabilityTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const ids = toArray(args.territoryIds) ?? [];
  if (ids.length === 0) {
    throw new Error("At least one territory ID is required.");
  }
  const body: SubscriptionAvailabilityCreateRequest = {
    data: {
      type: "subscriptionAvailabilities",
      attributes: {
        availableInNewTerritories: args.availableInNewTerritories,
      },
      relationships: {
        subscription: {
          data: { type: "subscriptions", id: args.subscriptionId },
        },
        availableTerritories: {
          data: ids.map((id) => ({ type: "territories" as const, id })),
        },
      },
    },
  };
  const result =
    await client.api.SubscriptionAvailabilities.subscriptionAvailabilitiesCreateInstance(
      { body }
    );
  const data =
    unwrapApiResult<SubscriptionAvailabilitiesCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
