import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionUpdateRequest,
  AppStoreVersionsUpdateInstanceResponse,
  AppStoreVersionsGetInstanceResponse,
  AppStoreVersionBuildLinkageRequest,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appStoreVersionId: z
    .string()
    .describe("App Store version ID to update (required)"),
  buildId: z
    .string()
    .optional()
    .describe(
      "Build ID to assign to this version (required for submit for review)"
    ),
  versionString: z
    .string()
    .optional()
    .describe("Version string (e.g. 1.2.0)"),
  copyright: z.string().optional().describe("Copyright text"),
  releaseType: z
    .enum(["MANUAL", "AFTER_APPROVAL", "SCHEDULED"])
    .optional()
    .describe("How to release after approval"),
  downloadable: z
    .boolean()
    .optional()
    .describe("Whether the version is downloadable"),
};
export const metadata: ToolMetadata = {
  name: "update-app-store-version",
  description:
    "Update an App Store version: assign a build, set version string, copyright, release type, or downloadable flag.",
  annotations: {
    title: "Update app store version",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateAppStoreVersionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const { appStoreVersionId, buildId, ...attrs } = args;

  if (buildId !== undefined) {
    const buildBody: AppStoreVersionBuildLinkageRequest = {
      data: {
        type: "builds",
        id: buildId,
      },
    };
    await client.api.AppStoreVersions.appStoreVersionsBuildUpdateToOneRelationship(
      {
        body: buildBody,
        path: { id: appStoreVersionId },
      }
    );
  }

  const hasAttrs =
    attrs.versionString !== undefined ||
    attrs.copyright !== undefined ||
    attrs.releaseType !== undefined ||
    attrs.downloadable !== undefined;

  if (!hasAttrs) {
    const version = await client.api.AppStoreVersions.appStoreVersionsGetInstance(
      { path: { id: appStoreVersionId } }
    );
    const data = unwrapApiResult<AppStoreVersionsGetInstanceResponse>(version);
    return JSON.stringify(data, null, 2);
  }

  const attributes: NonNullable<
    AppStoreVersionUpdateRequest["data"]["attributes"]
  > = {};
  if (attrs.versionString !== undefined)
    attributes.versionString = attrs.versionString;
  if (attrs.copyright !== undefined) attributes.copyright = attrs.copyright;
  if (attrs.releaseType !== undefined)
    attributes.releaseType = attrs.releaseType;
  if (attrs.downloadable !== undefined)
    attributes.downloadable = attrs.downloadable;

  const updateBody: AppStoreVersionUpdateRequest = {
    data: {
      type: "appStoreVersions",
      id: appStoreVersionId,
      attributes,
    },
  };
  const result =
    await client.api.AppStoreVersions.appStoreVersionsUpdateInstance({
      body: updateBody,
      path: { id: appStoreVersionId },
    });
  const data = unwrapApiResult<AppStoreVersionsUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
