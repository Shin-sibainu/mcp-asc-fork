import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionsAppStoreVersionPhasedReleaseGetToOneRelatedData,
  AppStoreVersionsAppStoreVersionPhasedReleaseGetToOneRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appStoreVersionId: z
    .string()
    .describe("App Store version ID. Phased release is optional per version."),
};

export const metadata: ToolMetadata = {
  name: "get-phased-release",
  description:
    "Get phased release for an App Store version (gradual rollout state). Returns 404 if version has no phased release.",
  annotations: {
    title: "Get phased release",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getPhasedReleaseTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const result =
    await client.api.AppStoreVersions.appStoreVersionsAppStoreVersionPhasedReleaseGetToOneRelated(
      {
        path: { id: args.appStoreVersionId },
      } as AppStoreVersionsAppStoreVersionPhasedReleaseGetToOneRelatedData
    );
  const data =
    unwrapApiResult<AppStoreVersionsAppStoreVersionPhasedReleaseGetToOneRelatedResponse>(
      result
    );
  return JSON.stringify(data, null, 2);
}
