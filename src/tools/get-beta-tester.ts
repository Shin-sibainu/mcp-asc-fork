import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaTestersGetInstanceData,
  BetaTestersGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  betaTesterId: z.string().describe("App Store Connect beta tester ID")
};

export const metadata: ToolMetadata = {
  name: "get-beta-tester",
  description: "Get detailed information about a specific beta tester",
  annotations: {
    title: "Get beta tester",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getBetaTesterTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<BetaTestersGetInstanceData, "path"> = {
    path: { id: args.betaTesterId },
  };
  const result =
    await client.api.BetaTesters.betaTestersGetInstance(opts);
  const data = unwrapApiResult<BetaTestersGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
