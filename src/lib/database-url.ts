export function resolveDatabaseUrl(connectionString: string | undefined) {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!connectionString.startsWith("prisma+postgres://")) {
    return connectionString;
  }

  try {
    const parsed = new URL(connectionString);
    const apiKey = parsed.searchParams.get("api_key");
    if (!apiKey) {
      throw new Error("Missing api_key in prisma+postgres DATABASE_URL");
    }

    const payload = JSON.parse(Buffer.from(apiKey, "base64").toString("utf8")) as {
      databaseUrl?: string;
    };

    if (!payload.databaseUrl) {
      throw new Error("Could not resolve database URL from prisma+postgres DATABASE_URL");
    }

    return payload.databaseUrl;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Invalid prisma+postgres DATABASE_URL: ${error.message}`
        : "Invalid prisma+postgres DATABASE_URL",
    );
  }
}
