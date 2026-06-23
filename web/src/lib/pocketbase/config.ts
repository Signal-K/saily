export const POCKETBASE_COOKIE_NAME = "ss_shared_pb_auth";
export const POCKETBASE_STORAGE_KEY = "ss_shared_pb_auth";

export type PocketBaseSession = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

export function getSharedPocketBaseUrl() {
  return process.env.SHARED_PB_URL ?? process.env.NEXT_PUBLIC_SHARED_PB_URL ?? "http://127.0.0.1:8090";
}

export function getBrowserSharedPocketBaseUrl() {
  return process.env.NEXT_PUBLIC_SHARED_PB_URL ?? "http://127.0.0.1:8090";
}

export function getSailyPocketBaseUrl() {
  return process.env.SAILY_PB_URL ?? process.env.NEXT_PUBLIC_SAILY_PB_URL ?? "http://127.0.0.1:8092";
}

export function getBrowserSailyPocketBaseUrl() {
  return process.env.NEXT_PUBLIC_SAILY_PB_URL ?? "http://127.0.0.1:8092";
}
