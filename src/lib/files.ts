import { db } from "@/lib/db";
import { canAccessJob } from "@/lib/jobs";
import { canAccessServiceRequestForEstimate } from "@/lib/estimates";
import type { User } from "@/generated/prisma/client";

export async function canUploadToServiceRequest(user: User, serviceRequestId: string) {
  if (user.role === "ADMIN") {
    return db.serviceRequest.findUnique({ where: { id: serviceRequestId } });
  }

  if (user.role === "CUSTOMER") {
    return canAccessServiceRequestForEstimate(user, serviceRequestId);
  }

  if (user.role === "CONTRACTOR") {
    const job = await db.job.findFirst({
      where: { serviceRequestId, contractorId: user.id },
    });
    if (!job) return null;
    return db.serviceRequest.findUnique({ where: { id: serviceRequestId } });
  }

  return null;
}

export async function canUploadToJob(user: User, jobId: string) {
  return canAccessJob(user, jobId);
}

export async function listAccessibleFiles({
  user,
  serviceRequestId,
  jobId,
}: {
  user: User;
  serviceRequestId?: string | null;
  jobId?: string | null;
}) {
  if (serviceRequestId) {
    const request = await canUploadToServiceRequest(user, serviceRequestId);
    if (!request) return null;

    return db.file.findMany({
      where: { serviceRequestId },
      orderBy: { createdAt: "desc" },
    });
  }

  if (jobId) {
    const job = await canUploadToJob(user, jobId);
    if (!job) return null;

    const visibilityFilter =
      user.role === "CUSTOMER"
        ? { isCustomerVisible: true }
        : user.role === "CONTRACTOR"
          ? {}
          : {};

    return db.file.findMany({
      where: { jobId, ...visibilityFilter },
      orderBy: { createdAt: "desc" },
    });
  }

  return null;
}
