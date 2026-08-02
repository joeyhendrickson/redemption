export function getAppUrl(request?: Request) {
  if (request) {
    const origin = request.headers.get("origin");
    if (origin && !origin.includes("localhost")) {
      return origin.replace(/\/$/, "");
    }

    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "http";
    if (host) {
      return `${protocol}://${host}`.replace(/\/$/, "");
    }
  }

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configuredUrl && !configuredUrl.includes("localhost")) {
    return configuredUrl;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return configuredUrl ?? "http://localhost:3000";
}

export function getAuthCallbackUrl(request?: Request, next = "/customer") {
  const safeNext = next.startsWith("/") ? next : "/customer";
  return `${getAppUrl(request)}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
