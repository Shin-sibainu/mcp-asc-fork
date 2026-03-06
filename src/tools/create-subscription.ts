import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionCreateRequest,
  SubscriptionsCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

const subscriptionPeriodEnum = z.enum([
  "ONE_WEEK",
  "ONE_MONTH",
  "TWO_MONTHS",
  "THREE_MONTHS",
  "SIX_MONTHS",
  "ONE_YEAR",
]);

export const schema = {
  subscriptionGroupId: z
    .string()
    .describe(
      "Subscription group ID (from list-subscription-groups or list-subscription-group-subscriptions context)"
    ),
  productId: z
    .string()
    .describe(
      "Product ID (e.g. premium_weekly_v1). Permanent; cannot be reused if deleted."
    ),
  name: z
    .string()
    .describe("Reference name for the subscription (e.g. Premium Weekly)"),
  subscriptionPeriod: subscriptionPeriodEnum
    .optional()
    .describe(
      "Duration: ONE_WEEK, ONE_MONTH, TWO_MONTHS, THREE_MONTHS, SIX_MONTHS, ONE_YEAR"
    ),
  familySharable: z
    .boolean()
    .optional()
    .describe("Whether the subscription is shareable with family"),
  reviewNote: z
    .string()
    .optional()
    .describe("Note for App Review (e.g. test account)"),
  groupLevel: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Level within the group for display order (0-based)"),
};

export const metadata: ToolMetadata = {
  name: "create-subscription",
  description:
    "Create an auto-renewable subscription in a subscription group. Requires productId (permanent) and name. Then add localizations and prices (create-subscription-localization, create-subscription-price).",
  annotations: {
    title: "Create subscription",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createSubscriptionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: SubscriptionCreateRequest = {
    data: {
      type: "subscriptions",
      attributes: {
        name: args.name,
        productId: args.productId,
        ...(args.subscriptionPeriod && {
          subscriptionPeriod: args.subscriptionPeriod,
        }),
        ...(args.familySharable !== undefined && {
          familySharable: args.familySharable,
        }),
        ...(args.reviewNote !== undefined && { reviewNote: args.reviewNote }),
        ...(args.groupLevel !== undefined && { groupLevel: args.groupLevel }),
      },
      relationships: {
        group: {
          data: {
            type: "subscriptionGroups",
            id: args.subscriptionGroupId,
          },
        },
      },
    },
  };
  const result =
    await client.api.Subscriptions.subscriptionsCreateInstance({ body });
  const data = unwrapApiResult<SubscriptionsCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
