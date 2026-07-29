import { db } from "@/lib/db";
import { canAccessJob } from "@/lib/jobs";
import type { User } from "@/generated/prisma/client";

export async function getJobReview(jobId: string) {
  return db.review.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}

export async function canViewJobReview(user: User, jobId: string) {
  const job = await canAccessJob(user, jobId);
  if (!job) return null;

  const review = await getJobReview(jobId);
  return { job, review };
}

export function canSubmitJobReview(job: { status: string; customerId: string }, user: User) {
  return (
    user.role === "CUSTOMER" &&
    job.customerId === user.id &&
    ["COMPLETED", "CLOSED"].includes(job.status)
  );
}

export function serializeReview(review: {
  id: string;
  jobId: string;
  customerId: string;
  type: string;
  overallRating: number | null;
  qualityRating: number | null;
  communicationRating: number | null;
  timelinessRating: number | null;
  cleanlinessRating: number | null;
  privateFeedback: string | null;
  testimonial: string | null;
  isPublished: boolean;
  unresolvedIssue: boolean;
  issueDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer?: { id: string; firstName: string; lastName: string; email: string };
}) {
  return {
    id: review.id,
    jobId: review.jobId,
    customerId: review.customerId,
    type: review.type,
    overallRating: review.overallRating,
    qualityRating: review.qualityRating,
    communicationRating: review.communicationRating,
    timelinessRating: review.timelinessRating,
    cleanlinessRating: review.cleanlinessRating,
    privateFeedback: review.privateFeedback,
    testimonial: review.testimonial,
    isPublished: review.isPublished,
    unresolvedIssue: review.unresolvedIssue,
    issueDescription: review.issueDescription,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    customer: review.customer ?? null,
  };
}
