export const isProd = process.env.NODE_ENV === "production";

export function appUrl() {
  const url = process.env.APP_URL;
  if (!url) throw new Error("APP_URL not set");
  return url.replace(/\/$/, "");
}

export function appHost() {
  return new URL(appUrl()).host;
}

export function requestBase(req: { nextUrl: URL } | { url: string }) {
  if (isProd) return appUrl();
  const origin =
    "nextUrl" in req ? req.nextUrl.origin : new URL(req.url).origin;
  return origin;
}

export const cookieSecure = isProd;
