import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { requireVendorNumber, decompressReportBody } from "../lib/reports-api.ts";
import type { SalesReportsGetCollectionData } from "@rage-against-the-pixel/app-store-connect-api";

const frequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
const reportTypeEnum = z.enum([
  "SALES",
  "PRE_ORDER",
  "NEWSSTAND",
  "INSTALLS",
  "SUBSCRIPTION",
  "SUBSCRIPTION_EVENT",
  "SUBSCRIBER",
  "FIRST_ANNUAL",
  "SUBSCRIPTION_OFFER_CODE_REDEMPTION",
  "WIN_BACK_ELIGIBILITY",
]);
const reportSubTypeEnum = z.enum([
  "SUMMARY",
  "DETAILED",
  "SUMMARY_CHANNEL",
  "SUMMARY_INSTALL_TYPE",
  "SUMMARY_TERRITORY",
]);

export const schema = {
  vendorNumber: z
    .string()
    .optional()
    .describe(
      "Vendor number (default: APP_STORE_CONNECT_VENDOR_NUMBER). Find in App Store Connect → Payments and Financial Reports."
    ),
  reportType: reportTypeEnum
    .default("SALES")
    .describe("Report type (e.g. SALES for sales and trends)"),
  reportSubType: reportSubTypeEnum
    .default("SUMMARY")
    .describe("Sub type (e.g. SUMMARY for summary report)"),
  frequency: frequencyEnum.describe(
    "Frequency: DAILY, WEEKLY, MONTHLY, or YEARLY"
  ),
  reportDate: z
    .string()
    .describe(
      "Report date: YYYY-MM-DD for DAILY, YYYY-MM for MONTHLY, YYYY for YEARLY; WEEKLY format varies by region"
    ),
  version: z
    .enum(["1_0", "1_1", "1_2", "1_3"])
    .optional()
    .describe(
      "Report schema version (default: 1_1 for DAILY SALES, else 1_0)"
    ),
};
export const metadata: ToolMetadata = {
  name: "download-sales-report",
  description:
    "Download a sales and trends report (gzip TSV). Requires APP_STORE_CONNECT_VENDOR_NUMBER. Returns decompressed tab-delimited text.",
  annotations: {
    title: "Download sales report",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

function defaultVersion(
  frequency: string,
  reportType: string
): "1_0" | "1_1" {
  if (frequency === "DAILY" && reportType === "SALES") return "1_1";
  return "1_0";
}

export default async function downloadSalesReportTool(
  args: InferSchema<typeof schema>
) {
  const vendorNumber = requireVendorNumber(args.vendorNumber);
  const version =
    args.version ?? defaultVersion(args.frequency, args.reportType);
  const query: SalesReportsGetCollectionData["query"] = {
    "filter[vendorNumber]": [vendorNumber],
    "filter[reportType]": [args.reportType],
    "filter[reportSubType]": [args.reportSubType],
    "filter[frequency]": [args.frequency],
    "filter[reportDate]": [args.reportDate],
    "filter[version]": [version],
  };
  const client = getClient();
  const result = await client.api.SalesReports.salesReportsGetCollection({
    query,
  });
  const body = unwrapApiResult(result);
  const text = await decompressReportBody(body);
  return text || "(empty report)";
}
