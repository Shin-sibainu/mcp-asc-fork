import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  ReviewSubmissionsGetInstanceData,
  ReviewSubmissionsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  reviewSubmissionId: z
    .string()
    .describe("Review submission ID (from list-review-submissions)"),
  include: z
    .array(
      z.enum([
        "app",
        "items",
        "appStoreVersionForReview",
        "submittedByActor",
        "lastUpdatedByActor",
      ])
    )
    .optional()
    .describe("Relationships to include"),
};

export const metadata: ToolMetadata = {
  name: "get-review-submission",
  description:
    "Get a single App Store review submission by ID (state, items, app, etc.)",
  annotations: {
    title: "Get review submission",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getReviewSubmissionTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<ReviewSubmissionsGetInstanceData, "path"> & {
    query?: ReviewSubmissionsGetInstanceData["query"];
  } = {
    path: { id: args.reviewSubmissionId },
    ...(args.include?.length && { query: { include: args.include } }),
  };
  const result =
    await client.api.ReviewSubmissions.reviewSubmissionsGetInstance(opts);
  const data = unwrapApiResult<ReviewSubmissionsGetInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
