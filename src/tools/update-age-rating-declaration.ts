import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { AgeRatingDeclarationUpdateRequest } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import type { AgeRatingDeclarationsUpdateInstanceResponse } from "@rage-against-the-pixel/app-store-connect-api";

export const schema = {
  ageRatingDeclarationId: z
    .string()
    .describe(
      "Age rating declaration ID (from get-app-info or app store version include)"
    ),
  ageRatingOverrideV2: z
    .enum(["NONE", "NINE_PLUS", "THIRTEEN_PLUS", "SIXTEEN_PLUS", "EIGHTEEN_PLUS", "UNRATED"])
    .optional()
    .describe("Override age rating (e.g. NINE_PLUS, THIRTEEN_PLUS)"),
  alcoholTobaccoOrDrugUseOrReferences: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  gambling: z.boolean().optional(),
  gamblingSimulated: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  horrorOrFearThemes: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  matureOrSuggestiveThemes: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  medicalOrTreatmentInformation: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  profanityOrCrudeHumor: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  sexualContentOrNudity: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  violenceCartoonOrFantasy: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  violenceRealistic: z
    .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE", "INFREQUENT", "FREQUENT"])
    .optional(),
  advertising: z.boolean().optional(),
  unrestrictedWebAccess: z.boolean().optional(),
  userGeneratedContent: z.boolean().optional(),
  developerAgeRatingInfoUrl: z.string().url().optional().nullable(),
};

export const metadata: ToolMetadata = {
  name: "update-age-rating-declaration",
  description:
    "Update age rating declaration for an app version (content ratings). Get ID from get-app-info or get-app-store-version include.",
  annotations: {
    title: "Update age rating declaration",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

export default async function updateAgeRatingDeclarationTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const attrs: NonNullable<AgeRatingDeclarationUpdateRequest["data"]["attributes"]> = {};
  const optionalKeys: (keyof typeof args)[] = [
    "ageRatingOverrideV2",
    "alcoholTobaccoOrDrugUseOrReferences",
    "gambling",
    "gamblingSimulated",
    "horrorOrFearThemes",
    "matureOrSuggestiveThemes",
    "medicalOrTreatmentInformation",
    "profanityOrCrudeHumor",
    "sexualContentOrNudity",
    "violenceCartoonOrFantasy",
    "violenceRealistic",
    "advertising",
    "unrestrictedWebAccess",
    "userGeneratedContent",
    "developerAgeRatingInfoUrl",
  ];
  for (const k of optionalKeys) {
    const v = args[k as keyof typeof args];
    if (v !== undefined) (attrs as Record<string, unknown>)[k] = v;
  }
  const body: AgeRatingDeclarationUpdateRequest = {
    data: {
      type: "ageRatingDeclarations",
      id: args.ageRatingDeclarationId,
      ...(Object.keys(attrs).length > 0 && { attributes: attrs }),
    },
  };
  const result =
    await client.api.AgeRatingDeclarations.ageRatingDeclarationsUpdateInstance({
      body,
      path: { id: args.ageRatingDeclarationId },
    });
  const data = unwrapApiResult<AgeRatingDeclarationsUpdateInstanceResponse>(result);
  return JSON.stringify(data, null, 2);
}
