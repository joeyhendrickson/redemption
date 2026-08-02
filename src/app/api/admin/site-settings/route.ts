import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const settings = await db.siteSettings.upsert({
    where: { id: "default" },
    update: body,
    create: { id: "default", ...body },
  });

  return NextResponse.json(settings);
}
