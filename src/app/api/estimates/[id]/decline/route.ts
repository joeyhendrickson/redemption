import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import {
  canAccessEstimate,
  declineEstimate,
  serializeEstimate,
} from "@/lib/estimates";
import { estimateDecisionSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const customer = await requireRole(["CUSTOMER"]);
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const estimate = await canAccessEstimate(customer, id);
  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = estimateDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const declined = await declineEstimate({
      estimateId: id,
      customerUserId: customer.id,
      note: parsed.data.note,
    });

    return NextResponse.json({ estimate: serializeEstimate(declined) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to decline estimate" },
      { status: 400 },
    );
  }
}
