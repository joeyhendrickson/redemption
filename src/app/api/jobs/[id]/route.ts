import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import {
  jobCompletedReviewEmail,
  sendEmail,
} from "@/lib/email";
import { canAccessJob, serializeJob } from "@/lib/jobs";
import { normalizePhoneNumber, sendSms } from "@/lib/sms";
import { jobUpdateSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await canAccessJob(user, id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job: serializeJob(job) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await canAccessJob(user, id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = jobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });
  }

  const data = parsed.data;
  const updated = await db.job.update({
    where: { id },
    data: {
      status: data.status,
      scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : undefined,
      scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
      accessInstructions: data.accessInstructions,
      safetyNotes: data.safetyNotes,
      propertyNotes: data.propertyNotes,
      completionOverride: data.completionOverride,
      completionOverrideReason: data.completionOverrideReason,
      actualEnd: data.status === "COMPLETED" ? new Date() : undefined,
    },
    include: {
      contractor: { select: { id: true, firstName: true, lastName: true, email: true } },
      tasks: { orderBy: { sortOrder: "asc" } },
      serviceRequest: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          referenceNumber: true,
        },
      },
    },
  });

  await createAuditLog({
    userId: user.id,
    jobId: id,
    action: "JOB_UPDATED",
    entityType: "Job",
    entityId: id,
    newValue: data,
  });

  if (data.status === "COMPLETED" && job.status !== "COMPLETED") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const reviewUrl = `${appUrl}/customer/jobs/${id}`;
    const customerName = `${updated.serviceRequest.firstName} ${updated.serviceRequest.lastName}`;

    await sendEmail({
      to: updated.serviceRequest.email,
      ...jobCompletedReviewEmail({
        name: updated.serviceRequest.firstName,
        jobReference: updated.referenceNumber,
        reviewUrl,
      }),
    });

    if (updated.serviceRequest.phone) {
      await sendSms({
        to: normalizePhoneNumber(updated.serviceRequest.phone),
        body: `Redemption Home Services: your job ${updated.referenceNumber} is complete. Share feedback at ${reviewUrl}`,
      });
    }
  }

  return NextResponse.json({ job: serializeJob(updated) });
}
