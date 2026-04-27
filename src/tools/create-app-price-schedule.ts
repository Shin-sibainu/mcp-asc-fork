import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppPriceScheduleCreateRequest,
  AppPriceSchedulesCreateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appId: z
    .string()
    .describe("App ID (from list-apps)"),
  baseTerritoryId: z
    .string()
    .describe(
      "Base territory ID (e.g. JPN, USA). The territory whose price point you set; other territories auto-calculate."
    ),
  manualPriceIds: z
    .array(z.string())
    .describe(
      "Array of inline price IDs referenced in the included array. Use placeholder IDs like '${price0}' that match the included objects."
    ),
  included: z
    .array(
      z.object({
        id: z.string().describe("Inline ID referenced by manualPriceIds (e.g. '${price0}')"),
        type: z.literal("appPrices").describe("Must be 'appPrices'"),
        attributes: z
          .object({
            startDate: z
              .string()
              .optional()
              .nullable()
              .describe("ISO 8601 date (YYYY-MM-DD). Null = immediate."),
          })
          .optional(),
        relationships: z.object({
          appPricePoint: z.object({
            data: z.object({
              type: z.literal("appPricePoints"),
              id: z.string().describe("App price point ID from list-app-price-points"),
            }),
          }),
        }),
      })
    )
    .describe(
      "Inline price objects. Each needs an id (placeholder), type 'appPrices', optional startDate, and appPricePoint relationship."
    ),
};

export const metadata: ToolMetadata = {
  name: "create-app-price-schedule",
  description:
    "Set or replace the price schedule for an app (free or paid). Overwrites the existing schedule. Use list-app-price-points to find price point IDs. For a free app, use the price point with customerPrice '0'. Requires base territory and at least one manual price.",
  annotations: {
    title: "Create app price schedule",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function createAppPriceScheduleTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();

  const body: AppPriceScheduleCreateRequest = {
    data: {
      type: "appPriceSchedules",
      relationships: {
        app: {
          data: { type: "apps", id: args.appId },
        },
        baseTerritory: {
          data: { type: "territories", id: args.baseTerritoryId },
        },
        manualPrices: {
          data: args.manualPriceIds.map((id) => ({
            type: "appPrices" as const,
            id,
          })),
        },
      },
    },
    included: args.included.map((item) => ({
      type: "appPrices" as const,
      id: item.id,
      attributes: {
        startDate: item.attributes?.startDate ?? null,
      },
      relationships: {
        appPricePoint: {
          data: {
            type: "appPricePoints" as const,
            id: item.relationships.appPricePoint.data.id,
          },
        },
      },
    })),
  };

  const result =
    await client.api.AppPriceSchedules.appPriceSchedulesCreateInstance({
      body,
    });
  const data =
    unwrapApiResult<AppPriceSchedulesCreateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
