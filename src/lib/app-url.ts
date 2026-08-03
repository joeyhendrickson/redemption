function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function isLocalhostUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Resolve the public app URL for links sent in emails and Supabase redirects.
 * Prefer configured production URLs over request headers so auth emails never
 * point at localhost when running on Vercel.
 */
export function getAppUrl(request?: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl && !isLocalhostUrl(configuredUrl)) {
    return stripTrailingSlash(configuredUrl);
  }

  if (process.env.VERCEL_URL) {
    return stripTrailingSlash(`https://${process.env.VERCEL_URL}`);
  }

  if (request) {
    const origin = request.headers.get("origin");
    if (origin && !isLocalhostUrl(origin)) {
      return stripTrailingSlash(origin);
    }

    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "https";
    if (host && !isLocalhostUrl(host)) {
      return stripTrailingSlash(`${protocol}://${host}`);
    }
  }

  if (configuredUrl) {
    return stripTrailingSlash(configuredUrl);
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(request?: Request, next = "/customer") {
  const safeNext = next.startsWith("/") ? next : "/customer";
  return `${getAppUrl(request)}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function getPasswordRecoveryCallbackUrl(request?: Request) {
  return `${getAppUrl(request)}/auth/callback?type=recovery&next=/forgot-password`;
}
