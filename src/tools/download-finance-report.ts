import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { requireVendorNumber, decompressReportBody } from "../lib/reports-api.ts";
import type { FinanceReportsGetCollectionData } from "@rage-against-the-pixel/app-store-connect-api";

const reportTypeEnum = z.enum(["FINANCIAL", "FINANCE_DETAIL"]);

export const schema = {
  vendorNumber: z
    .string()
    .optional()
    .describe(
      "Vendor number (default: APP_STORE_CONNECT_VENDOR_NUMBER). Find in App Store Connect → Payments and Financial Reports."
    ),
  regionCode: z
    .string()
    .describe(
      "Region/currency code (e.g. US, EU, Z1 for all Financial Detail, ZZ for Consolidated)"
    ),
  reportType: reportTypeEnum
    .default("FINANCIAL")
    .describe("FINANCIAL (summary) or FINANCE_DETAIL"),
  reportDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Use YYYY-MM")
    .describe("Report month (YYYY-MM)"),
};
export const metadata: ToolMetadata = {
  name: "download-finance-report",
  description:
    "Download a finance report (gzip TSV). Requires APP_STORE_CONNECT_VENDOR_NUMBER. Returns decompressed tab-delimited text.",
  annotations: {
    title: "Download finance report",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

export default async function downloadFinanceReportTool(
  args: InferSchema<typeof schema>
) {
  const vendorNumber = requireVendorNumber(args.vendorNumber);
  const query: FinanceReportsGetCollectionData["query"] = {
    "filter[vendorNumber]": [vendorNumber],
    "filter[regionCode]": [args.regionCode],
    "filter[reportType]": [args.reportType],
    "filter[reportDate]": [args.reportDate],
  };
  const client = getClient();
  const result = await client.api.FinanceReports.financeReportsGetCollection({
    query,
  });
  const body = unwrapApiResult(result);
  const text = await decompressReportBody(body);
  return text || "(empty report)";
}
