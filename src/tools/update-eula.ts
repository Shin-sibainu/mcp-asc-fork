import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { EndUserLicenseAgreementUpdateRequest } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import type { EndUserLicenseAgreementsUpdateInstanceResponse } from "@rage-against-the-pixel/app-store-connect-api";

export const schema = {
  eulaId: z
    .string()
    .describe("EULA ID (from get-eula)"),
  agreementText: z
    .string()
    .optional()
    .describe("New EULA text (plain text or HTML)"),
  territoryIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Territory IDs to apply this EULA to (from list-territories). Omit to keep current."),
};

export const metadata: ToolMetadata = {
  name: "update-eula",
  description:
    "Update app EULA text and/or territories. Get EULA ID from get-eula.",
  annotations: {
    title: "Update EULA",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateEulaTool(args: InferSchema<typeof schema>) {
  if (args.agreementText === undefined && args.territoryIds === undefined) {
    throw new Error("Provide at least one of agreementText or territoryIds");
  }
  const client = getClient();
  const data: EndUserLicenseAgreementUpdateRequest["data"] = {
    type: "endUserLicenseAgreements",
    id: args.eulaId,
    ...(args.agreementText !== undefined && {
      attributes: { agreementText: args.agreementText },
    }),
    ...(args.territoryIds !== undefined && {
      relationships: {
        territories: {
          data: (Array.isArray(args.territoryIds) ? args.territoryIds : [args.territoryIds]).map(
            (id) => ({ type: "territories" as const, id })
          ),
        },
      },
    }),
  };
  const result =
    await client.api.EndUserLicenseAgreements.endUserLicenseAgreementsUpdateInstance(
      { body: { data }, path: { id: args.eulaId } }
    );
  const out = unwrapApiResult<EndUserLicenseAgreementsUpdateInstanceResponse>(result);
  return JSON.stringify(out, null, 2);
}
