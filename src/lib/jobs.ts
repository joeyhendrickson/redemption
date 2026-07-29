import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { getSiteSettings } from "@/lib/site-settings";
import { calculateJobProgress } from "@/lib/utils/helpers";
import type { JobStatus, TaskStatus, User } from "@/generated/prisma/client";

export async function canAccessJob(user: User, jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      contractor: { select: { id: true, firstName: true, lastName: true, email: true } },
      tasks: { orderBy: { sortOrder: "asc" } },
      serviceRequest: { select: { referenceNumber: true } },
    },
  });

  if (!job) return null;

  if (user.role === "ADMIN") return job;
  if (user.role === "CUSTOMER" && job.customerId === user.id) return job;
  if (user.role === "CONTRACTOR" && job.contractorId === user.id) return job;

  return null;
}

export async function recalculateJobProgress(jobId: string) {
  const [job, settings, tasks] = await Promise.all([
    db.job.findUnique({ where: { id: jobId } }),
    getSiteSettings(),
    db.task.findMany({ where: { jobId, status: { not: "CANCELLED" } } }),
  ]);

  if (!job) return null;

  if (job.completionOverride != null) {
    return job.completionOverride;
  }

  const percentage = calculateJobProgress(
    tasks.map((task) => ({ progressPercentage: task.progressPercentage, weight: task.weight })),
    settings.progressMethod,
  );

  let nextStatus = job.status;
  if (percentage >= 100 && !["QUALITY_REVIEW", "COMPLETED", "CLOSED", "CANCELLED"].includes(job.status)) {
    nextStatus = "QUALITY_REVIEW";
  } else if (percentage > 0 && percentage < 100 && ["ASSIGNED", "SCHEDULED", "CONFIRMED"].includes(job.status)) {
    nextStatus = "IN_PROGRESS";
  }

  return db.job.update({
    where: { id: jobId },
    data: {
      completionPercentage: percentage,
      status: nextStatus,
    },
  });
}

export function serializeTask(task: {
  id: string;
  jobId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  progressPercentage: number;
  weight: number;
  sortOrder: number;
  estimatedHours: unknown;
  actualHours: unknown;
  materialsRequired: string | null;
  blockerReason: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    jobId: task.jobId,
    title: task.title,
    description: task.description,
    status: task.status,
    progressPercentage: task.progressPercentage,
    weight: task.weight,
    sortOrder: task.sortOrder,
    estimatedHours: task.estimatedHours ? Number(task.estimatedHours) : null,
    actualHours: task.actualHours ? Number(task.actualHours) : null,
    materialsRequired: task.materialsRequired,
    blockerReason: task.blockerReason,
    completedAt: task.completedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function serializeJob(job: {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  serviceAddress: string;
  city: string;
  state: string;
  zipCode: string;
  status: JobStatus;
  priority: string;
  completionPercentage: number;
  completionOverride: number | null;
  completionOverrideReason: string | null;
  accessInstructions: string | null;
  safetyNotes: string | null;
  propertyNotes: string | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  contractorId: string | null;
  customerId: string;
  contractor?: { id: string; firstName: string; lastName: string; email: string } | null;
  tasks?: Array<Parameters<typeof serializeTask>[0]>;
}) {
  return {
    id: job.id,
    referenceNumber: job.referenceNumber,
    title: job.title,
    description: job.description,
    serviceAddress: job.serviceAddress,
    city: job.city,
    state: job.state,
    zipCode: job.zipCode,
    status: job.status,
    priority: job.priority,
    completionPercentage: job.completionPercentage,
    completionOverride: job.completionOverride,
    completionOverrideReason: job.completionOverrideReason,
    accessInstructions: job.accessInstructions,
    safetyNotes: job.safetyNotes,
    propertyNotes: job.propertyNotes,
    scheduledStart: job.scheduledStart?.toISOString() ?? null,
    scheduledEnd: job.scheduledEnd?.toISOString() ?? null,
    contractorId: job.contractorId,
    customerId: job.customerId,
    contractor: job.contractor ?? null,
    tasks: job.tasks?.map(serializeTask) ?? [],
  };
}

export async function assignContractorToJob({
  jobId,
  contractorId,
  adminUserId,
}: {
  jobId: string;
  contractorId: string;
  adminUserId: string;
}) {
  const contractor = await db.user.findFirst({
    where: { id: contractorId, role: "CONTRACTOR", isActive: true },
  });

  if (!contractor) {
    throw new Error("Contractor not found");
  }

  const job = await db.job.update({
    where: { id: jobId },
    data: {
      contractorId,
      managerId: adminUserId,
      status: "ASSIGNED",
    },
    include: {
      contractor: { select: { id: true, firstName: true, lastName: true, email: true } },
      tasks: { orderBy: { sortOrder: "asc" } },
    },
  });

  await createAuditLog({
    userId: adminUserId,
    jobId,
    action: "JOB_ASSIGNED",
    entityType: "Job",
    entityId: jobId,
    newValue: { contractorId, status: "ASSIGNED" },
  });

  return job;
}
