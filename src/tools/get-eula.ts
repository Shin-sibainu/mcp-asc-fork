import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsEndUserLicenseAgreementGetToOneRelatedData,
  AppsEndUserLicenseAgreementGetToOneRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z.string().describe("App ID. EULA is one per app (with optional territory variants)."),
};

export const metadata: ToolMetadata = {
  name: "get-eula",
  description:
    "Get End User License Agreement (EULA) for an app. Returns agreement text and territory. Create/update via update-eula or App Store Connect UI.",
  annotations: {
    title: "Get EULA",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function getEulaTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const result =
    await client.api.Apps.appsEndUserLicenseAgreementGetToOneRelated({
      path: { id: args.appId },
    } as AppsEndUserLicenseAgreementGetToOneRelatedData);
  const data =
    unwrapApiResult<AppsEndUserLicenseAgreementGetToOneRelatedResponse>(result);
  return JSON.stringify(data, null, 2);
}
