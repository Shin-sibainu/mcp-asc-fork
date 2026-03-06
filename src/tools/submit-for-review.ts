import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import {
  Platform,
  type ReviewSubmissionCreateRequest,
  type ReviewSubmissionsCreateInstanceResponse,
  type ReviewSubmissionItemCreateRequest,
  type ReviewSubmissionItemsCreateInstanceResponse,
  type ReviewSubmissionUpdateRequest,
  type ReviewSubmissionsUpdateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]);

export const schema = {
  appId: z.string().describe("App ID (required)"),
  appStoreVersionId: z
    .string()
    .describe("App Store version ID to submit for review (required)"),
  platform: platformEnum
    .optional()
    .describe("Platform for the submission (optional)"),
};
export const metadata: ToolMetadata = {
  name: "submit-for-review",
  description:
    "Submit an App Store version for review. Creates a review submission, adds the version as an item, and marks it as submitted.",
  annotations: {
    title: "Submit for review",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function submitForReviewTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();

  // 1. Create review submission for the app
  const createBody: ReviewSubmissionCreateRequest = {
    data: {
      type: "reviewSubmissions",
      relationships: {
        app: {
          data: {
            type: "apps",
            id: args.appId,
          },
        },
      },
      ...(args.platform && {
        attributes: { platform: Platform[args.platform] },
      }),
    },
  };
  const createResult =
    await client.api.ReviewSubmissions.reviewSubmissionsCreateInstance({
      body: createBody,
    });
  const submission = unwrapApiResult<ReviewSubmissionsCreateInstanceResponse>(
    createResult
  );
  const submissionId = submission.data.id;

  // 2. Add app store version as submission item
  const itemBody: ReviewSubmissionItemCreateRequest = {
    data: {
      type: "reviewSubmissionItems",
      relationships: {
        reviewSubmission: {
          data: {
            type: "reviewSubmissions",
            id: submissionId,
          },
        },
        appStoreVersion: {
          data: {
            type: "appStoreVersions",
            id: args.appStoreVersionId,
          },
        },
      },
    },
  };
  await client.api.ReviewSubmissionItems.reviewSubmissionItemsCreateInstance({
    body: itemBody,
  }).then((r) => unwrapApiResult<ReviewSubmissionItemsCreateInstanceResponse>(r));

  // 3. Mark submission as submitted
  const updateBody: ReviewSubmissionUpdateRequest = {
    data: {
      type: "reviewSubmissions",
      id: submissionId,
      attributes: {
        submitted: true,
      },
    },
  };
  const updateResult =
    await client.api.ReviewSubmissions.reviewSubmissionsUpdateInstance({
      body: updateBody,
      path: { id: submissionId },
    });
  const updated = unwrapApiResult<ReviewSubmissionsUpdateInstanceResponse>(
    updateResult
  );
  return JSON.stringify(updated, null, 2);
}
