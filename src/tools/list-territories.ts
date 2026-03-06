import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { TerritoriesGetCollectionResponse } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of territories to return (default 100, max 200)"
    ),
};

export const metadata: ToolMetadata = {
  name: "list-territories",
  description:
    "Get the list of territories (countries/regions) for App Store availability",
  annotations: {
    title: "List territories",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listTerritoriesTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const result = await client.api.Territories.territoriesGetCollection({
    query: args,
  });
  const data = unwrapApiResult<TerritoriesGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
