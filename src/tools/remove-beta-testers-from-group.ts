import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { BetaGroupBetaTestersLinkagesRequest } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  betaGroupId: z
    .string()
    .describe("Beta group ID to remove testers from (required)"),
  betaTesterIds: z
    .union([z.string(), z.array(z.string())])
    .describe(
      "Beta tester ID(s) to remove (one or more; use list-beta-testers to get IDs)"
    ),
};
export const metadata: ToolMetadata = {
  name: "remove-beta-testers-from-group",
  description:
    "Remove one or more beta testers from a TestFlight group. Tester IDs come from list-beta-testers.",
  annotations: {
    title: "Remove beta testers from group",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

export default async function removeBetaTestersFromGroupTool(
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
  await client.api.BetaGroups.betaGroupsBetaTestersDeleteToManyRelationship({
    body,
    path: { id: args.betaGroupId },
  });
  return JSON.stringify(
    {
      ok: true,
      message: `Removed ${ids.length} beta tester(s) from group ${args.betaGroupId}`,
      betaTesterIds: ids,
      betaGroupId: args.betaGroupId,
    },
    null,
    2
  );
}
