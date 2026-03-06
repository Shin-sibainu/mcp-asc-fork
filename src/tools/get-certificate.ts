import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  CertificatesGetInstanceData,
  CertificatesGetInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  certificateId: z.string().describe("App Store Connect certificate ID")
};

export const metadata: ToolMetadata = {
  name: "get-certificate",
  description: "Get detailed information about a specific signing certificate",
  annotations: {
    title: "Get certificate",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getCertificateTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<CertificatesGetInstanceData, "path"> = {
    path: { id: args.certificateId },
  };
  const result =
    await client.api.Certificates.certificatesGetInstance(opts);
  const data = unwrapApiResult<CertificatesGetInstanceResponse>(result);
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}
