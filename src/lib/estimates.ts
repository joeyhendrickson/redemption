import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { generateReferenceNumber } from "@/lib/utils/helpers";
import type { Estimate, ServiceRequest, User } from "@/generated/prisma/client";

export function serializeEstimate(estimate: Estimate) {
  return {
    id: estimate.id,
    serviceRequestId: estimate.serviceRequestId,
    jobId: estimate.jobId,
    status: estimate.status,
    title: estimate.title,
    description: estimate.description,
    laborCost: Number(estimate.laborCost),
    materialsCost: Number(estimate.materialsCost),
    totalCost: Number(estimate.totalCost),
    validUntil: estimate.validUntil?.toISOString() ?? null,
    sentAt: estimate.sentAt?.toISOString() ?? null,
    approvedAt: estimate.approvedAt?.toISOString() ?? null,
    declinedAt: estimate.declinedAt?.toISOString() ?? null,
    createdAt: estimate.createdAt.toISOString(),
    updatedAt: estimate.updatedAt.toISOString(),
  };
}

export async function canAccessServiceRequestForEstimate(user: User, serviceRequestId: string) {
  const request = await db.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: { job: true, estimates: { orderBy: { createdAt: "desc" } } },
  });

  if (!request) return null;

  if (user.role === "ADMIN") return request;

  if (user.role === "CUSTOMER") {
    if (request.customerId === user.id || request.email === user.email) {
      return request;
    }
    return null;
  }

  return null;
}

export async function canAccessEstimate(user: User, estimateId: string) {
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    include: {
      serviceRequest: { include: { job: true } },
    },
  });

  if (!estimate) return null;

  const request = await canAccessServiceRequestForEstimate(user, estimate.serviceRequestId);
  if (!request) return null;

  if (user.role === "CUSTOMER" && estimate.status === "DRAFT") {
    return null;
  }

  return estimate;
}

export async function convertApprovedRequestToJob({
  request,
  customerId,
  managerId,
}: {
  request: ServiceRequest;
  customerId: string;
  managerId?: string;
}) {
  const existingJob = await db.job.findUnique({
    where: { serviceRequestId: request.id },
  });

  if (existingJob) return existingJob;

  return db.job.create({
    data: {
      referenceNumber: generateReferenceNumber("JOB"),
      serviceRequestId: request.id,
      customerId,
      managerId,
      title: request.title,
      description: request.description,
      serviceAddress: request.serviceAddress,
      city: request.city,
      state: request.state,
      zipCode: request.zipCode,
      priority: request.priority,
      accessInstructions: request.accessInstructions,
      status: "UNASSIGNED",
    },
  });
}

export async function sendEstimate({
  estimateId,
  adminUserId,
}: {
  estimateId: string;
  adminUserId: string;
}) {
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    include: { serviceRequest: true },
  });

  if (!estimate || estimate.status !== "DRAFT") {
    throw new Error("Only draft estimates can be sent");
  }

  const now = new Date();
  const updated = await db.$transaction(async (tx) => {
    const sentEstimate = await tx.estimate.update({
      where: { id: estimateId },
      data: {
        status: "SENT",
        sentAt: now,
      },
    });

    await tx.serviceRequest.update({
      where: { id: estimate.serviceRequestId },
      data: { status: "CUSTOMER_APPROVAL_PENDING" },
    });

    return sentEstimate;
  });

  await createAuditLog({
    userId: adminUserId,
    serviceRequestId: estimate.serviceRequestId,
    action: "ESTIMATE_SENT",
    entityType: "Estimate",
    entityId: estimate.id,
    previousValue: { status: "DRAFT" },
    newValue: { status: "SENT" },
  });

  return updated;
}

export async function approveEstimate({
  estimateId,
  customerUserId,
}: {
  estimateId: string;
  customerUserId: string;
}) {
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    include: { serviceRequest: { include: { job: true } } },
  });

  if (!estimate) throw new Error("Estimate not found");
  if (estimate.status !== "SENT") throw new Error("This estimate is not awaiting approval");

  if (estimate.validUntil && estimate.validUntil < new Date()) {
    await db.estimate.update({
      where: { id: estimateId },
      data: { status: "EXPIRED" },
    });
    throw new Error("This estimate has expired");
  }

  const now = new Date();

  const result = await db.$transaction(async (tx) => {
    const approvedEstimate = await tx.estimate.update({
      where: { id: estimateId },
      data: {
        status: "APPROVED",
        approvedAt: now,
      },
    });

    const request = await tx.serviceRequest.update({
      where: { id: estimate.serviceRequestId },
      data: {
        customerId: estimate.serviceRequest.customerId ?? customerUserId,
        status: "ACCEPTED",
      },
    });

    const job =
      estimate.serviceRequest.job ??
      (await tx.job.create({
        data: {
          referenceNumber: generateReferenceNumber("JOB"),
          serviceRequestId: request.id,
          customerId: request.customerId ?? customerUserId,
          title: request.title,
          description: request.description,
          serviceAddress: request.serviceAddress,
          city: request.city,
          state: request.state,
          zipCode: request.zipCode,
          priority: request.priority,
          accessInstructions: request.accessInstructions,
          status: "UNASSIGNED",
        },
      }));

    await tx.estimate.update({
      where: { id: estimateId },
      data: { jobId: job.id },
    });

    await tx.serviceRequest.update({
      where: { id: request.id },
      data: { status: "CONVERTED_TO_JOB" },
    });

    return { approvedEstimate, job };
  });

  await createAuditLog({
    userId: customerUserId,
    serviceRequestId: estimate.serviceRequestId,
    jobId: result.job.id,
    action: "ESTIMATE_APPROVED",
    entityType: "Estimate",
    entityId: estimate.id,
    newValue: { status: "APPROVED", jobId: result.job.id },
  });

  return result;
}

export async function declineEstimate({
  estimateId,
  customerUserId,
  note,
}: {
  estimateId: string;
  customerUserId: string;
  note?: string;
}) {
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
  });

  if (!estimate) throw new Error("Estimate not found");
  if (estimate.status !== "SENT") throw new Error("This estimate is not awaiting approval");

  const now = new Date();

  const updated = await db.$transaction(async (tx) => {
    const declinedEstimate = await tx.estimate.update({
      where: { id: estimateId },
      data: {
        status: "DECLINED",
        declinedAt: now,
      },
    });

    await tx.serviceRequest.update({
      where: { id: estimate.serviceRequestId },
      data: { status: "DECLINED" },
    });

    if (note) {
      await tx.note.create({
        data: {
          serviceRequestId: estimate.serviceRequestId,
          authorId: customerUserId,
          visibility: "CUSTOMER",
          content: `Estimate declined: ${note}`,
        },
      });
    }

    return declinedEstimate;
  });

  await createAuditLog({
    userId: customerUserId,
    serviceRequestId: estimate.serviceRequestId,
    action: "ESTIMATE_DECLINED",
    entityType: "Estimate",
    entityId: estimate.id,
    newValue: { status: "DECLINED", note },
  });

  return updated;
}
