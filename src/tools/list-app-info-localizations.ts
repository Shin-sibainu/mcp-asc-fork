import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppInfosAppInfoLocalizationsGetToManyRelatedData,
  AppInfoLocalizationsResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  appInfoId: z
    .string()
    .describe("App info ID (from list-app-infos)"),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of localizations to return (default 50, max 200)"),
  "filter.locale": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by locale(s) (e.g. en-US, ja)"),
};

export const metadata: ToolMetadata = {
  name: "list-app-info-localizations",
  description:
    "List app info localizations for an app (name, subtitle, privacy policy URL per locale). Get IDs needed for update-app-info-localization.",
  annotations: {
    title: "List app info localizations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppInfoLocalizationsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<
    AppInfosAppInfoLocalizationsGetToManyRelatedData,
    "path" | "query"
  > = {
    path: { id: args.appInfoId },
    query: {
      limit: args.limit,
      ...(toArray(args["filter.locale"])?.length && {
        "filter[locale]": toArray(args["filter.locale"])!,
      }),
    },
  };
  const result =
    await client.api.AppInfos.appInfosAppInfoLocalizationsGetToManyRelated(opts);
  const data = unwrapApiResult<AppInfoLocalizationsResponse>(result);
  return JSON.stringify(data, null, 2);
}
