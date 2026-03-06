import type { ErrorResponse } from "@rage-against-the-pixel/app-store-connect-api";

/** Human-readable message from App Store Connect API ErrorResponse */
export function formatApiError(error: ErrorResponse): string {
  const parts = error.errors?.map((e) => {
    const msg = e.detail || e.title || e.code;
    return e.code ? `[${e.code}] ${msg}` : msg;
  });
  return parts?.length ? parts.join("; ") : JSON.stringify(error);
}

/** Thrown when an API call returns an error; carries the raw ErrorResponse */
export class AppStoreConnectApiError extends Error {
  constructor(
    public readonly response: ErrorResponse,
    message = formatApiError(response)
  ) {
    super(message);
    this.name = "AppStoreConnectApiError";
  }
}

/** Result shape returned by SDK methods (data + error union) */
export type ApiResult<TData, TError> =
  | { data: TData; error: undefined }
  | { data: undefined; error: TError };

/**
 * Returns data or throws AppStoreConnectApiError with formatted message.
 * Use after an API call to narrow the result and get typed data.
 */
export function unwrapApiResult<TData, TError = ErrorResponse>(
  result: ApiResult<TData, TError> & { response?: Response }
): TData {
  if (result.error) {
    const status = result.response?.status;
    const prefix = status ? `HTTP ${status}: ` : "";
    throw new AppStoreConnectApiError(
      result.error as ErrorResponse,
      prefix + formatApiError(result.error as ErrorResponse)
    );
  }
  return result.data as TData;
}
