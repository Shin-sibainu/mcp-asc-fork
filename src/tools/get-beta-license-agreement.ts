import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaLicenseAgreementsGetInstanceData,
  BetaLicenseAgreementsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  betaLicenseAgreementId: z
    .string()
    .describe("Beta license agreement ID (from list-beta-license-agreements)"),
};

export const metadata: ToolMetadata = {
  name: "get-beta-license-agreement",
  description:
    "Get TestFlight beta license agreement text for an app. Update with update-beta-license-agreement.",
  annotations: {
    title: "Get beta license agreement",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getBetaLicenseAgreementTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<BetaLicenseAgreementsGetInstanceData, "path"> = {
    path: { id: args.betaLicenseAgreementId },
  };
  const result =
    await client.api.BetaLicenseAgreements.betaLicenseAgreementsGetInstance(opts);
  const data = unwrapApiResult<BetaLicenseAgreementsGetInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
