import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import type { CustomerReviewResponseV1Response } from "@rage-against-the-pixel/app-store-connect-api";

export const schema = {
  customerReviewId: z
    .string()
    .describe(
      "Customer review ID (from list-customer-reviews; the review to respond to)"
    ),
  responseBody: z
    .string()
    .min(1)
    .describe("Developer response text (visible to the user)"),
};

export const metadata: ToolMetadata = {
  name: "create-customer-review-response",
  description:
    "Reply to an App Store customer review. One response per review; use list-customer-reviews to get review IDs.",
  annotations: {
    title: "Create customer review response",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createCustomerReviewResponseTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const result =
    await client.api.CustomerReviewResponses.customerReviewResponsesCreateInstance(
      {
        body: {
          data: {
            type: "customerReviewResponses",
            attributes: {
              responseBody: args.responseBody,
            },
            relationships: {
              review: {
                data: {
                  type: "customerReviews",
                  id: args.customerReviewId,
                },
              },
            },
          },
        },
      }
    );
  const data = unwrapApiResult<CustomerReviewResponseV1Response>(result);
  return JSON.stringify(data, null, 2);
}
