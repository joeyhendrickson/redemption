import { db } from "@/lib/db";

export async function createAuditLog({
  userId,
  serviceRequestId,
  jobId,
  action,
  entityType,
  entityId,
  previousValue,
  newValue,
  description,
}: {
  userId?: string;
  serviceRequestId?: string;
  jobId?: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: unknown;
  newValue?: unknown;
  description?: string;
}) {
  return db.auditLog.create({
    data: {
      userId,
      serviceRequestId,
      jobId,
      action,
      entityType,
      entityId,
      previousValue: previousValue ? JSON.parse(JSON.stringify(previousValue)) : undefined,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
      description,
    },
  });
}
