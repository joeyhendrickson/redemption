export function getAppUrl(request?: Request) {
  if (request) {
    const origin = request.headers.get("origin");
    if (origin) return origin.replace(/\/$/, "");

    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "http";
    if (host) return `${protocol}://${host}`.replace(/\/$/, "");
  }

  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getAuthCallbackUrl(request?: Request, next = "/customer") {
  const safeNext = next.startsWith("/") ? next : "/customer";
  return `${getAppUrl(request)}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
