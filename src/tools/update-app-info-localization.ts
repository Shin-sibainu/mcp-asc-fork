import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppInfoLocalizationUpdateRequest,
  AppInfoLocalizationsUpdateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appInfoLocalizationId: z
    .string()
    .describe(
      "App info localization ID (from list-app-info-localizations)"
    ),
  name: z
    .string()
    .optional()
    .nullable()
    .describe("App name for this locale"),
  subtitle: z
    .string()
    .optional()
    .nullable()
    .describe("App subtitle for this locale"),
  privacyPolicyUrl: z
    .string()
    .optional()
    .nullable()
    .describe("Privacy policy URL for this locale"),
  privacyChoicesUrl: z
    .string()
    .optional()
    .nullable()
    .describe("Privacy choices URL for this locale"),
  privacyPolicyText: z
    .string()
    .optional()
    .nullable()
    .describe("Privacy policy text for this locale"),
};

export const metadata: ToolMetadata = {
  name: "update-app-info-localization",
  description:
    "Update app info localization: set privacy policy URL, app name, subtitle, or privacy text for a specific locale. Get the localization ID from list-app-info-localizations.",
  annotations: {
    title: "Update app info localization",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateAppInfoLocalizationTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const { appInfoLocalizationId, ...fields } = args;

  const attributes: NonNullable<
    AppInfoLocalizationUpdateRequest["data"]["attributes"]
  > = {};

  const keys = [
    "name",
    "subtitle",
    "privacyPolicyUrl",
    "privacyChoicesUrl",
    "privacyPolicyText",
  ] as const;

  for (const key of keys) {
    if (fields[key] !== undefined) {
      (attributes as Record<string, unknown>)[key] = fields[key];
    }
  }

  const body: AppInfoLocalizationUpdateRequest = {
    data: {
      type: "appInfoLocalizations",
      id: appInfoLocalizationId,
      ...(Object.keys(attributes).length > 0 && { attributes }),
    },
  };

  const result =
    await client.api.AppInfoLocalizations.appInfoLocalizationsUpdateInstance({
      body,
      path: { id: appInfoLocalizationId },
    });
  const data =
    unwrapApiResult<AppInfoLocalizationsUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
