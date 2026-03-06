import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import {
  Platform,
  type AppStoreVersionCreateRequest,
  type AppStoreVersionsCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]);

export const schema = {
  appId: z.string().describe("App ID (required)"),
  platform: platformEnum.describe("Platform (e.g. IOS, MAC_OS)"),
  versionString: z
    .string()
    .describe("Version string for the store (e.g. 1.2.0)"),
  copyright: z.string().optional().describe("Copyright text"),
  releaseType: z
    .enum(["MANUAL", "AFTER_APPROVAL", "SCHEDULED"])
    .optional()
    .describe("How to release after approval (default: MANUAL)"),
  buildId: z
    .string()
    .optional()
    .describe("Optional build ID to attach to this version"),
};
export const metadata: ToolMetadata = {
  name: "create-app-store-version",
  description:
    "Create a new App Store version for an app (platform + version string). Optionally attach a build.",
  annotations: {
    title: "Create app store version",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createAppStoreVersionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: AppStoreVersionCreateRequest = {
    data: {
      type: "appStoreVersions",
      attributes: {
        platform: Platform[args.platform],
        versionString: args.versionString,
        ...(args.copyright !== undefined && { copyright: args.copyright }),
        ...(args.releaseType !== undefined && {
          releaseType: args.releaseType,
        }),
      },
      relationships: {
        app: {
          data: {
            type: "apps",
            id: args.appId,
          },
        },
        ...(args.buildId !== undefined && {
          build: {
            data: {
              type: "builds",
              id: args.buildId,
            },
          },
        }),
      },
    },
  };
  const result =
    await client.api.AppStoreVersions.appStoreVersionsCreateInstance({ body });
  const data = unwrapApiResult<AppStoreVersionsCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
