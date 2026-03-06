import { gunzipSync } from "node:zlib";

export function getVendorNumber(): string | undefined {
  return process.env.APP_STORE_CONNECT_VENDOR_NUMBER;
}

export function requireVendorNumber(override?: string): string {
  const v = override ?? getVendorNumber();
  if (!v || v.trim() === "") {
    throw new Error(
      "Vendor number is required for sales/finance reports. Set APP_STORE_CONNECT_VENDOR_NUMBER or pass vendorNumber. Find it in App Store Connect → Payments and Financial Reports (gray bar top left)."
    );
  }
  return v.trim();
}

/** Decompress gzip response body from SDK (Blob or ArrayBuffer) to UTF-8 text */
export async function decompressReportBody(
  body: Blob | ArrayBuffer | Buffer
): Promise<string> {
  const buf =
    body instanceof Buffer
      ? body
      : body instanceof ArrayBuffer
        ? Buffer.from(body)
        : Buffer.from(await (body as Blob).arrayBuffer());
  if (buf.length === 0) return "";
  return gunzipSync(buf).toString("utf8");
}
