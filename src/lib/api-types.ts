import type { AppsGetInstanceData } from "@rage-against-the-pixel/app-store-connect-api";

/** Input shape we send to appsGetInstance (path + optional query) */
export type GetAppOptions = Pick<AppsGetInstanceData, "path"> & {
  query?: Pick<NonNullable<AppsGetInstanceData["query"]>, "include">;
};

/** Allowed 'include' relationship values for appsGetInstance — must match API */
export type GetAppIncludeOption =
  NonNullable<NonNullable<AppsGetInstanceData["query"]>["include"]>[number];

const APP_GET_INSTANCE_INCLUDE_OPTIONS: readonly GetAppIncludeOption[] = [
  "appEncryptionDeclarations",
  "appStoreIcon",
  "ciProduct",
  "betaGroups",
  "appStoreVersions",
  "preReleaseVersions",
  "betaAppLocalizations",
  "builds",
  "betaLicenseAgreement",
  "betaAppReviewDetail",
  "appInfos",
  "appClips",
  "endUserLicenseAgreement",
  "inAppPurchases",
  "subscriptionGroups",
  "gameCenterEnabledVersions",
  "appCustomProductPages",
  "inAppPurchasesV2",
  "promotedPurchases",
  "appEvents",
  "reviewSubmissions",
  "subscriptionGracePeriod",
  "gameCenterDetail",
  "appStoreVersionExperimentsV2",
  "androidToIosAppMappingDetails",
] as const;

/** Runtime tuple for Zod enum; stays in sync with AppsGetInstanceData query.include */
export const getAppIncludeOptions = [
  ...APP_GET_INSTANCE_INCLUDE_OPTIONS,
] as [GetAppIncludeOption, ...GetAppIncludeOption[]];
