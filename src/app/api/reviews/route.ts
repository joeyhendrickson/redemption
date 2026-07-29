import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { reviewIssueAlertEmail, sendEmail } from "@/lib/email";
import { canAccessJob } from "@/lib/jobs";
import {
  canSubmitJobReview,
  canViewJobReview,
  getJobReview,
  serializeReview,
} from "@/lib/reviews";
import { reviewSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  const result = await canViewJobReview(user, jobId);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    review: result.review ? serializeReview(result.review) : null,
    canSubmit: canSubmitJobReview(result.job, user) && !result.review,
  });
}

export async function POST(request: Request) {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review" }, { status: 400 });
  }

  const { jobId, ...reviewData } = parsed.data;
  const job = await canAccessJob(user, jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!canSubmitJobReview(job, user)) {
    return NextResponse.json({ error: "This job is not ready for review" }, { status: 400 });
  }

  const existing = await getJobReview(jobId);
  if (existing) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  if (reviewData.unresolvedIssue && !reviewData.issueDescription?.trim()) {
    return NextResponse.json({ error: "Please describe the unresolved issue" }, { status: 400 });
  }

  const review = await db.review.create({
    data: {
      jobId,
      customerId: user.id,
      type: "POST_COMPLETION",
      overallRating: reviewData.overallRating,
      qualityRating: reviewData.qualityRating ?? reviewData.overallRating,
      communicationRating: reviewData.communicationRating ?? reviewData.overallRating,
      timelinessRating: reviewData.timelinessRating ?? reviewData.overallRating,
      cleanlinessRating: reviewData.cleanlinessRating ?? reviewData.overallRating,
      privateFeedback: reviewData.privateFeedback,
      testimonial: reviewData.testimonial,
      unresolvedIssue: reviewData.unresolvedIssue ?? false,
      issueDescription: reviewData.issueDescription,
    },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  const nextStatus = review.unresolvedIssue ? "WAITING_ON_CUSTOMER" : "CLOSED";
  await db.job.update({
    where: { id: jobId },
    data: { status: nextStatus },
  });

  await createAuditLog({
    userId: user.id,
    jobId,
    action: "REVIEW_SUBMITTED",
    entityType: "Review",
    entityId: review.id,
    newValue: {
      overallRating: review.overallRating,
      unresolvedIssue: review.unresolvedIssue,
      nextStatus,
    },
  });

  if (review.unresolvedIssue) {
    const settings = await db.siteSettings.findUnique({ where: { id: "default" } });
    const adminEmail = settings?.email ?? process.env.EMAIL_FROM;
    if (adminEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await sendEmail({
        to: adminEmail,
        ...reviewIssueAlertEmail({
          jobReference: job.referenceNumber,
          customerName: `${user.firstName} ${user.lastName}`,
          issueDescription: review.issueDescription ?? "No description provided",
          adminUrl: `${appUrl}/admin/jobs/${jobId}`,
        }),
      });
    }
  }

  return NextResponse.json({ review: serializeReview(review) }, { status: 201 });
}
