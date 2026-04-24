import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionLocalizationUpdateRequest,
  AppStoreVersionLocalizationsUpdateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appStoreVersionLocalizationId: z
    .string()
    .describe(
      "App Store version localization ID to update (from list-app-store-version-localizations)"
    ),
  description: z
    .string()
    .optional()
    .nullable()
    .describe("App description for this locale"),
  keywords: z
    .string()
    .optional()
    .nullable()
    .describe("Comma-separated keywords for this locale"),
  marketingUrl: z
    .string()
    .optional()
    .nullable()
    .describe("Marketing URL for this locale"),
  promotionalText: z
    .string()
    .optional()
    .nullable()
    .describe("Promotional text shown above the description (can be updated without a new submission)"),
  supportUrl: z
    .string()
    .optional()
    .nullable()
    .describe("Support URL for this locale"),
  whatsNew: z
    .string()
    .optional()
    .nullable()
    .describe("What's new text (release notes) for this locale"),
};

export const metadata: ToolMetadata = {
  name: "update-app-store-version-localization",
  description:
    "Update localized metadata (description, keywords, URLs, what's new, promotional text) for a specific App Store version locale. Get the localization ID from list-app-store-version-localizations.",
  annotations: {
    title: "Update app store version localization",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateAppStoreVersionLocalizationTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const { appStoreVersionLocalizationId, ...fields } = args;

  const attributes: NonNullable<
    AppStoreVersionLocalizationUpdateRequest["data"]["attributes"]
  > = {};

  const keys = [
    "description",
    "keywords",
    "marketingUrl",
    "promotionalText",
    "supportUrl",
    "whatsNew",
  ] as const;

  for (const key of keys) {
    if (fields[key] !== undefined) {
      (attributes as Record<string, unknown>)[key] = fields[key];
    }
  }

  const body: AppStoreVersionLocalizationUpdateRequest = {
    data: {
      type: "appStoreVersionLocalizations",
      id: appStoreVersionLocalizationId,
      ...(Object.keys(attributes).length > 0 && { attributes }),
    },
  };

  const result =
    await client.api.AppStoreVersionLocalizations.appStoreVersionLocalizationsUpdateInstance(
      {
        body,
        path: { id: appStoreVersionLocalizationId },
      }
    );
  const data =
    unwrapApiResult<AppStoreVersionLocalizationsUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
