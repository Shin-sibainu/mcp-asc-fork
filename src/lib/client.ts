import {
  AppStoreConnectClient,
  type AppStoreConnectOptions,
} from "@rage-against-the-pixel/app-store-connect-api";

let clientInstance: AppStoreConnectClient | null = null;

export function getClient(): AppStoreConnectClient {
  if (clientInstance) return clientInstance;
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
  const p8Path = process.env.APP_STORE_CONNECT_P8_PATH;
  if (!keyId || !issuerId || !p8Path) {
    throw new Error(
      "Set APP_STORE_CONNECT_KEY_ID, APP_STORE_CONNECT_ISSUER_ID, APP_STORE_CONNECT_P8_PATH"
    );
  }
  clientInstance = new AppStoreConnectClient({
    issuerId,
    privateKeyId: keyId,
    privateKeyFile: p8Path,
  } as AppStoreConnectOptions);
  return clientInstance;
}
