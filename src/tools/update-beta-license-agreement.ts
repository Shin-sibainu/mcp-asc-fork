import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { BetaLicenseAgreementUpdateRequest } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import type { BetaLicenseAgreementsUpdateInstanceResponse } from "@rage-against-the-pixel/app-store-connect-api";

export const schema = {
  betaLicenseAgreementId: z
    .string()
    .describe("Beta license agreement ID (from get-beta-license-agreement)"),
  agreementText: z
    .string()
    .describe("New TestFlight license agreement text"),
};

export const metadata: ToolMetadata = {
  name: "update-beta-license-agreement",
  description:
    "Update TestFlight (beta) license agreement text. Required for external testing.",
  annotations: {
    title: "Update beta license agreement",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateBetaLicenseAgreementTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const body: BetaLicenseAgreementUpdateRequest = {
    data: {
      type: "betaLicenseAgreements",
      id: args.betaLicenseAgreementId,
      attributes: { agreementText: args.agreementText },
    },
  };
  const result =
    await client.api.BetaLicenseAgreements.betaLicenseAgreementsUpdateInstance({
      body,
      path: { id: args.betaLicenseAgreementId },
    });
  const data = unwrapApiResult<BetaLicenseAgreementsUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
