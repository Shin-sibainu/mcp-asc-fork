import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  UsersGetInstanceData,
  UsersGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  userId: z.string().describe("App Store Connect user (team member) ID"),
};

export const metadata: ToolMetadata = {
  name: "get-user",
  description: "Get detailed information about a team member (user)",
  annotations: {
    title: "Get user",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getUserTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const opts: Pick<UsersGetInstanceData, "path"> = {
    path: { id: args.userId },
  };
  const result = await client.api.Users.usersGetInstance(opts);
  const data = unwrapApiResult<UsersGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
