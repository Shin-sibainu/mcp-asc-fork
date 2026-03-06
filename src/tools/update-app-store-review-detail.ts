import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { AppStoreReviewDetailUpdateRequest } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import type { AppStoreReviewDetailsUpdateInstanceResponse } from "@rage-against-the-pixel/app-store-connect-api";

export const schema = {
  appStoreReviewDetailId: z
    .string()
    .describe(
      "App Store review detail ID (from get-app-store-review-detail or get-app-store-version with include)"
    ),
  contactFirstName: z.string().optional().describe("Contact first name for App Review"),
  contactLastName: z.string().optional().describe("Contact last name for App Review"),
  contactPhone: z.string().optional().describe("Contact phone for App Review"),
  contactEmail: z.string().optional().describe("Contact email for App Review"),
  demoAccountName: z.string().optional().describe("Demo account username (if app requires login)"),
  demoAccountPassword: z.string().optional().describe("Demo account password"),
  demoAccountRequired: z.boolean().optional().describe("Whether a demo account is required"),
  notes: z.string().optional().describe("Notes for the App Review team"),
};

export const metadata: ToolMetadata = {
  name: "update-app-store-review-detail",
  description:
    "Update App Review details for a version: contact, demo account, notes. Required before submit for review if app needs login or special instructions.",
  annotations: {
    title: "Update app store review detail",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateAppStoreReviewDetailTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const attrs: AppStoreReviewDetailUpdateRequest["data"]["attributes"] = {};
  if (args.contactFirstName !== undefined) attrs.contactFirstName = args.contactFirstName;
  if (args.contactLastName !== undefined) attrs.contactLastName = args.contactLastName;
  if (args.contactPhone !== undefined) attrs.contactPhone = args.contactPhone;
  if (args.contactEmail !== undefined) attrs.contactEmail = args.contactEmail;
  if (args.demoAccountName !== undefined) attrs.demoAccountName = args.demoAccountName;
  if (args.demoAccountPassword !== undefined) attrs.demoAccountPassword = args.demoAccountPassword;
  if (args.demoAccountRequired !== undefined) attrs.demoAccountRequired = args.demoAccountRequired;
  if (args.notes !== undefined) attrs.notes = args.notes;

  const body: AppStoreReviewDetailUpdateRequest = {
    data: {
      type: "appStoreReviewDetails",
      id: args.appStoreReviewDetailId,
      ...(Object.keys(attrs).length > 0 && { attributes: attrs }),
    },
  };
  const result =
    await client.api.AppStoreReviewDetails.appStoreReviewDetailsUpdateInstance({
      body,
      path: { id: args.appStoreReviewDetailId },
    });
  const data = unwrapApiResult<AppStoreReviewDetailsUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
