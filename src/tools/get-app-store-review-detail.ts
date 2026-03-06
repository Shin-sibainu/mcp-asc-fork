import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionsAppStoreReviewDetailGetToOneRelatedData,
  AppStoreVersionsAppStoreReviewDetailGetToOneRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appStoreVersionId: z
    .string()
    .describe(
      "App Store version ID. Review detail (contact, demo account, notes) is per version."
    ),
};

export const metadata: ToolMetadata = {
  name: "get-app-store-review-detail",
  description:
    "Get App Review details for an App Store version: contact info, demo account, notes for reviewers. Set these before submitting for review.",
  annotations: {
    title: "Get app store review detail",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getAppStoreReviewDetailTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const result =
    await client.api.AppStoreVersions.appStoreVersionsAppStoreReviewDetailGetToOneRelated(
      {
        path: { id: args.appStoreVersionId },
      } as AppStoreVersionsAppStoreReviewDetailGetToOneRelatedData
    );
  const data =
    unwrapApiResult<AppStoreVersionsAppStoreReviewDetailGetToOneRelatedResponse>(
      result
    );
  return JSON.stringify(data, null, 2);
}
