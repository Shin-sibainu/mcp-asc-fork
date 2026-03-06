import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  SubscriptionLocalizationCreateRequest,
  SubscriptionLocalizationsCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  subscriptionId: z
    .string()
    .describe(
      "Subscription ID (from create-subscription or list-subscription-group-subscriptions)"
    ),
  name: z.string().describe("Localized display name for the subscription"),
  locale: z
    .string()
    .describe("Locale (e.g. en-US, de-DE). One localization per locale."),
  description: z
    .string()
    .optional()
    .describe("Localized description for the subscription"),
};

export const metadata: ToolMetadata = {
  name: "create-subscription-localization",
  description:
    "Create a localized name/description for a subscription. Add one per locale (e.g. en-US, de-DE). Required for submission.",
  annotations: {
    title: "Create subscription localization",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createSubscriptionLocalizationTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: SubscriptionLocalizationCreateRequest = {
    data: {
      type: "subscriptionLocalizations",
      attributes: {
        name: args.name,
        locale: args.locale,
        ...(args.description !== undefined && {
          description: args.description,
        }),
      },
      relationships: {
        subscription: {
          data: { type: "subscriptions", id: args.subscriptionId },
        },
      },
    },
  };
  const result =
    await client.api.SubscriptionLocalizations.subscriptionLocalizationsCreateInstance(
      { body }
    );
  const data =
    unwrapApiResult<SubscriptionLocalizationsCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
