import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEstimate, serializeEstimate } from "@/lib/estimates";
import { sendEmail } from "@/lib/email";
import { normalizePhoneNumber, sendSms } from "@/lib/sms";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const estimate = await db.estimate.findUnique({
    where: { id },
    include: { serviceRequest: true },
  });

  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  try {
    const sent = await sendEstimate({ estimateId: id, adminUserId: admin.id });

    await sendEmail({
      to: estimate.serviceRequest.email,
      subject: `Estimate ready for review — ${estimate.serviceRequest.referenceNumber}`,
      html: `
        <h1>Your estimate is ready</h1>
        <p>We prepared an estimate for <strong>${estimate.title}</strong>.</p>
        <p>Total: <strong>$${Number(sent.totalCost).toFixed(2)}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/customer/requests/${estimate.serviceRequestId}">Review and approve the estimate</a></p>
      `,
    });

    if (estimate.serviceRequest.phone) {
      await sendSms({
        to: normalizePhoneNumber(estimate.serviceRequest.phone),
        body: `Redemption Home Services: your estimate for ${estimate.serviceRequest.referenceNumber} is ready. Total $${Number(sent.totalCost).toFixed(2)}.`,
      });
    }

    return NextResponse.json({ estimate: serializeEstimate(sent) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send estimate" },
      { status: 400 },
    );
  }
}
