import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Signed in, but no app profile was found. The database may still need its first-time setup.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  } catch (error) {
    console.error("[auth/profile] failed", error);
    if (error instanceof Error && /DATABASE_URL is not set|P1001|Can't reach database|connection terminated|ECONNREFUSED/i.test(error.message)) {
      return NextResponse.json(
        {
          error: "Database unavailable",
          message:
            "Your sign-in worked, but the app cannot reach the database. Update DATABASE_URL on Vercel with your current Supabase connection string (use the pooler URI from Supabase → Connect).",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Profile lookup failed",
        message: "The app database is not available yet. Check DATABASE_URL on Vercel.",
      },
      { status: 503 },
    );
  }
}
