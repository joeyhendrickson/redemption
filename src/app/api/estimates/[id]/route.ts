import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { canAccessEstimate, serializeEstimate } from "@/lib/estimates";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(["ADMIN", "CUSTOMER"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const estimate = await canAccessEstimate(user, id);
  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  return NextResponse.json({ estimate: serializeEstimate(estimate) });
}
