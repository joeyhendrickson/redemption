import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { serializeReview } from "@/lib/reviews";
import { reviewUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = reviewUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid update" }, { status: 400 });
  }

  const existing = await db.review.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      job: { select: { referenceNumber: true, city: true } },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const updated = await db.review.update({
    where: { id },
    data: parsed.data,
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (parsed.data.isPublished && existing.testimonial && !existing.isPublished) {
    await db.testimonial.create({
      data: {
        name: `${existing.customer.firstName} ${existing.customer.lastName.charAt(0)}.`,
        location: existing.job.city,
        content: existing.testimonial,
        rating: existing.overallRating ?? 5,
        isActive: true,
      },
    });
  }

  await createAuditLog({
    userId: admin.id,
    jobId: existing.jobId,
    action: "REVIEW_UPDATED",
    entityType: "Review",
    entityId: id,
    newValue: parsed.data,
  });

  return NextResponse.json({ review: serializeReview(updated) });
}
