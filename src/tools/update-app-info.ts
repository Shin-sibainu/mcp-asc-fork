import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppInfoUpdateRequest,
  AppInfosUpdateInstanceResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

export const schema = {
  appInfoId: z
    .string()
    .describe("App info ID (from list-app-infos)"),
  primaryCategoryId: z
    .string()
    .optional()
    .describe(
      "Primary category ID (from list-app-categories). e.g. FINANCE, UTILITIES"
    ),
  primarySubcategoryOneId: z
    .string()
    .optional()
    .describe("Primary subcategory one ID (from list-app-categories)"),
  primarySubcategoryTwoId: z
    .string()
    .optional()
    .describe("Primary subcategory two ID (from list-app-categories)"),
  secondaryCategoryId: z
    .string()
    .optional()
    .describe("Secondary category ID (from list-app-categories)"),
  secondarySubcategoryOneId: z
    .string()
    .optional()
    .describe("Secondary subcategory one ID (from list-app-categories)"),
  secondarySubcategoryTwoId: z
    .string()
    .optional()
    .describe("Secondary subcategory two ID (from list-app-categories)"),
};

export const metadata: ToolMetadata = {
  name: "update-app-info",
  description:
    "Update app info: set primary/secondary categories and subcategories. Get app info ID from list-app-infos, category IDs from list-app-categories.",
  annotations: {
    title: "Update app info",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

function categoryRelationship(id: string | undefined) {
  if (!id) return undefined;
  return { data: { type: "appCategories" as const, id } };
}

export default async function updateAppInfoTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();

  const relationships: NonNullable<
    AppInfoUpdateRequest["data"]["relationships"]
  > = {};

  if (args.primaryCategoryId !== undefined) {
    relationships.primaryCategory = categoryRelationship(args.primaryCategoryId);
  }
  if (args.primarySubcategoryOneId !== undefined) {
    relationships.primarySubcategoryOne = categoryRelationship(args.primarySubcategoryOneId);
  }
  if (args.primarySubcategoryTwoId !== undefined) {
    relationships.primarySubcategoryTwo = categoryRelationship(args.primarySubcategoryTwoId);
  }
  if (args.secondaryCategoryId !== undefined) {
    relationships.secondaryCategory = categoryRelationship(args.secondaryCategoryId);
  }
  if (args.secondarySubcategoryOneId !== undefined) {
    relationships.secondarySubcategoryOne = categoryRelationship(args.secondarySubcategoryOneId);
  }
  if (args.secondarySubcategoryTwoId !== undefined) {
    relationships.secondarySubcategoryTwo = categoryRelationship(args.secondarySubcategoryTwoId);
  }

  const body: AppInfoUpdateRequest = {
    data: {
      type: "appInfos",
      id: args.appInfoId,
      ...(Object.keys(relationships).length > 0 && { relationships }),
    },
  };

  const result = await client.api.AppInfos.appInfosUpdateInstance({
    body,
    path: { id: args.appInfoId },
  });
  const data = unwrapApiResult<AppInfosUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
