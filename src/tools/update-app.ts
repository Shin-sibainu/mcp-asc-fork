import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppUpdateRequest,
  AppResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z
    .string()
    .describe("App ID (from list-apps)"),
  contentRightsDeclaration: z
    .enum([
      "DOES_NOT_USE_THIRD_PARTY_CONTENT",
      "USES_THIRD_PARTY_CONTENT",
    ])
    .optional()
    .describe(
      "Content rights declaration. Use DOES_NOT_USE_THIRD_PARTY_CONTENT for apps with only original content."
    ),
  subscriptionStatusUrl: z
    .string()
    .optional()
    .nullable()
    .describe("Server URL for subscription status updates (App Store Server Notifications V2)"),
  subscriptionStatusUrlForSandbox: z
    .string()
    .optional()
    .nullable()
    .describe("Sandbox server URL for subscription status updates"),
  primaryLocale: z
    .string()
    .optional()
    .nullable()
    .describe("Primary locale (e.g. en-US, ja)"),
};

export const metadata: ToolMetadata = {
  name: "update-app",
  description:
    "Update app-level settings: content rights declaration, subscription status URL, primary locale. Note: contentRightsDeclaration may return 409/403 on some accounts.",
  annotations: {
    title: "Update app",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateAppTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const { appId, ...fields } = args;

  const attributes: NonNullable<
    AppUpdateRequest["data"]["attributes"]
  > = {};

  const keys = [
    "contentRightsDeclaration",
    "subscriptionStatusUrl",
    "subscriptionStatusUrlForSandbox",
    "primaryLocale",
  ] as const;

  for (const key of keys) {
    if (fields[key] !== undefined) {
      (attributes as Record<string, unknown>)[key] = fields[key];
    }
  }

  const body: AppUpdateRequest = {
    data: {
      type: "apps",
      id: appId,
      ...(Object.keys(attributes).length > 0 && { attributes }),
    },
  };

  const result = await client.api.Apps.appsUpdateInstance({
    body,
    path: { id: appId },
  });
  const data = unwrapApiResult<AppResponse>(result);
  return JSON.stringify(data, null, 2);
}
