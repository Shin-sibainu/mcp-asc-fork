import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  ActorsGetInstanceData,
  ActorsGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  actorId: z
    .string()
    .describe(
      "Actor ID (user or API key identity). Often returned in submission/version responses as submittedByActor or lastUpdatedByActor."
    ),
};

export const metadata: ToolMetadata = {
  name: "get-actor",
  description:
    "Get actor (user or API key) by ID. Actors appear in review submissions and version history. Use list-actors with known IDs to resolve.",
  annotations: {
    title: "Get actor",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getActorTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const opts: Pick<ActorsGetInstanceData, "path"> = {
    path: { id: args.actorId },
  };
  const result = await client.api.Actors.actorsGetInstance(opts);
  const data = unwrapApiResult<ActorsGetInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
