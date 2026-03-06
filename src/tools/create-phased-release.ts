import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionPhasedReleaseCreateRequest,
  PhasedReleaseState,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import type { AppStoreVersionPhasedReleaseResponse } from "@rage-against-the-pixel/app-store-connect-api";

const phasedReleaseStateEnum = z.enum([
  "INACTIVE",
  "ACTIVE",
  "PAUSED",
  "COMPLETE",
]);

export const schema = {
  appStoreVersionId: z
    .string()
    .describe("App Store version ID to enable phased release for"),
  phasedReleaseState: phasedReleaseStateEnum
    .optional()
    .describe("Initial state (INACTIVE, ACTIVE, PAUSED, COMPLETE)"),
};

export const metadata: ToolMetadata = {
  name: "create-phased-release",
  description:
    "Enable phased release for an App Store version (gradual rollout to users). Version must be approved or already in release.",
  annotations: {
    title: "Create phased release",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createPhasedReleaseTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: AppStoreVersionPhasedReleaseCreateRequest = {
    data: {
      type: "appStoreVersionPhasedReleases",
      relationships: {
        appStoreVersion: {
          data: { type: "appStoreVersions", id: args.appStoreVersionId },
        },
      },
      ...(args.phasedReleaseState && {
        attributes: {
          phasedReleaseState: args.phasedReleaseState as PhasedReleaseState,
        },
      }),
    },
  };
  const result =
    await client.api.AppStoreVersionPhasedReleases.appStoreVersionPhasedReleasesCreateInstance(
      { body }
    );
  const data = unwrapApiResult<AppStoreVersionPhasedReleaseResponse>(result);
  return JSON.stringify(data, null, 2);
}
