import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  DevicesGetInstanceData,
  DevicesGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  deviceId: z.string().describe("App Store Connect device ID")
};

export const metadata: ToolMetadata = {
  name: "get-device",
  description: "Get detailed information about a specific registered device",
  annotations: {
    title: "Get device",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getDeviceTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const opts: Pick<DevicesGetInstanceData, "path"> = {
    path: { id: args.deviceId },
  };
  const result = await client.api.Devices.devicesGetInstance(opts);
  const data = unwrapApiResult<DevicesGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
