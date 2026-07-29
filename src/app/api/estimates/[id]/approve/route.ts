import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import {
  approveEstimate,
  canAccessEstimate,
  serializeEstimate,
} from "@/lib/estimates";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db";
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
    const result = await approveEstimate({
      estimateId: id,
      customerUserId: customer.id,
    });

    const requestRecord = await db.serviceRequest.findUnique({
      where: { id: estimate.serviceRequestId },
    });

    if (requestRecord) {
      await sendEmail({
        to: requestRecord.email,
        subject: `Estimate approved — ${requestRecord.referenceNumber}`,
        html: `
          <h1>Thank you for approving your estimate</h1>
          <p>Your job reference is <strong>${result.job.referenceNumber}</strong>.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/customer/jobs">View your job</a></p>
        `,
      });
    }

    return NextResponse.json({
      estimate: serializeEstimate(result.approvedEstimate),
      job: {
        id: result.job.id,
        referenceNumber: result.job.referenceNumber,
        status: result.job.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve estimate" },
      { status: 400 },
    );
  }
}
