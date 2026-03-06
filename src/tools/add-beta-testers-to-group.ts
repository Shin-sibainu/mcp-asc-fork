import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { BetaGroupBetaTestersLinkagesRequest } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  betaGroupId: z
    .string()
    .describe("Beta group ID to add testers to (required)"),
  betaTesterIds: z
    .union([z.string(), z.array(z.string())])
    .describe(
      "Beta tester ID(s) to add (one or more; use list-beta-testers to get IDs)"
    ),
};
export const metadata: ToolMetadata = {
  name: "add-beta-testers-to-group",
  description:
    "Add one or more beta testers to a TestFlight group. Tester IDs come from list-beta-testers.",
  annotations: {
    title: "Add beta testers to group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

export default async function addBetaTestersToGroupTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const ids = toArray(args.betaTesterIds);
  if (!ids?.length) {
    throw new Error("At least one beta tester ID is required");
  }
  const body: BetaGroupBetaTestersLinkagesRequest = {
    data: ids.map((id) => ({ type: "betaTesters" as const, id })),
  };
  await client.api.BetaGroups.betaGroupsBetaTestersCreateToManyRelationship({
    body,
    path: { id: args.betaGroupId },
  });
  return JSON.stringify(
    {
      ok: true,
      message: `Added ${ids.length} beta tester(s) to group ${args.betaGroupId}`,
      betaTesterIds: ids,
      betaGroupId: args.betaGroupId,
    },
    null,
    2
  );
}
