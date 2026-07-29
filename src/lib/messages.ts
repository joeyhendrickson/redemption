import { db } from "@/lib/db";
import type { MessageVisibility, User, UserRole } from "@/generated/prisma/client";

export function visibleVisibilitiesForRole(role: UserRole): MessageVisibility[] {
  switch (role) {
    case "ADMIN":
      return ["CUSTOMER", "CONTRACTOR", "INTERNAL", "ADMIN_CONTRACTOR"];
    case "CONTRACTOR":
      return ["CUSTOMER", "ADMIN_CONTRACTOR", "CONTRACTOR"];
    case "CUSTOMER":
      return ["CUSTOMER"];
    default:
      return [];
  }
}

export function defaultVisibilityForRole(role: UserRole): MessageVisibility {
  switch (role) {
    case "ADMIN":
      return "CUSTOMER";
    case "CONTRACTOR":
      return "ADMIN_CONTRACTOR";
    case "CUSTOMER":
    default:
      return "CUSTOMER";
  }
}

export async function getAccessibleContexts(user: User) {
  if (user.role === "ADMIN") {
    const [requests, jobs] = await Promise.all([
      db.serviceRequest.findMany({
        orderBy: { updatedAt: "desc" },
        take: 100,
        select: { id: true, title: true, referenceNumber: true },
      }),
      db.job.findMany({
        orderBy: { updatedAt: "desc" },
        take: 100,
        select: { id: true, title: true, referenceNumber: true, serviceRequestId: true },
      }),
    ]);

    return {
      requests: requests.map((request) => ({
        id: request.id,
        label: request.title,
        referenceNumber: request.referenceNumber,
      })),
      jobs: jobs.map((job) => ({
        id: job.id,
        label: job.title,
        referenceNumber: job.referenceNumber,
        serviceRequestId: job.serviceRequestId,
      })),
    };
  }

  if (user.role === "CUSTOMER") {
    const [requests, jobs] = await Promise.all([
      db.serviceRequest.findMany({
        where: {
          OR: [{ customerId: user.id }, { email: user.email }],
        },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, referenceNumber: true },
      }),
      db.job.findMany({
        where: { customerId: user.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, referenceNumber: true, serviceRequestId: true },
      }),
    ]);

    return {
      requests: requests.map((request) => ({
        id: request.id,
        label: request.title,
        referenceNumber: request.referenceNumber,
      })),
      jobs: jobs.map((job) => ({
        id: job.id,
        label: job.title,
        referenceNumber: job.referenceNumber,
        serviceRequestId: job.serviceRequestId,
      })),
    };
  }

  const jobs = await db.job.findMany({
    where: { contractorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      referenceNumber: true,
      serviceRequestId: true,
    },
  });

  return {
    requests: [],
    jobs: jobs.map((job) => ({
      id: job.id,
      label: job.title,
      referenceNumber: job.referenceNumber,
      serviceRequestId: job.serviceRequestId,
    })),
  };
}

export async function canAccessServiceRequest(user: User, serviceRequestId: string) {
  if (user.role === "ADMIN") return true;

  const request = await db.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    select: { customerId: true, email: true },
  });

  if (!request) return false;

  if (user.role === "CUSTOMER") {
    return request.customerId === user.id || request.email === user.email;
  }

  if (user.role === "CONTRACTOR") {
    const job = await db.job.findFirst({
      where: { serviceRequestId, contractorId: user.id },
      select: { id: true },
    });
    return !!job;
  }

  return false;
}

export async function canAccessJob(user: User, jobId: string) {
  if (user.role === "ADMIN") return true;

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { customerId: true, contractorId: true },
  });

  if (!job) return false;
  if (user.role === "CUSTOMER") return job.customerId === user.id;
  if (user.role === "CONTRACTOR") return job.contractorId === user.id;
  return false;
}

export async function canAccessMessage(user: User, messageId: string) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      replies: { select: { id: true } },
    },
  });

  if (!message) return null;

  const visibilities = visibleVisibilitiesForRole(user.role);
  if (!visibilities.includes(message.visibility)) return null;

  if (message.jobId && !(await canAccessJob(user, message.jobId))) return null;
  if (message.serviceRequestId && !(await canAccessServiceRequest(user, message.serviceRequestId))) {
    return null;
  }

  return message;
}

export type SerializedMessage = {
  id: string;
  subject: string | null;
  body: string;
  visibility: MessageVisibility;
  isRead: boolean;
  createdAt: string;
  parentMessageId: string | null;
  serviceRequestId: string | null;
  jobId: string | null;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  replies: SerializedMessage[];
  contextLabel?: string;
  contextReference?: string;
};

export function serializeMessage(
  message: {
    id: string;
    subject: string | null;
    body: string;
    visibility: MessageVisibility;
    isRead: boolean;
    createdAt: Date;
    parentMessageId: string | null;
    serviceRequestId: string | null;
    jobId: string | null;
    sender: { id: string; firstName: string; lastName: string; role: UserRole };
    replies?: Array<{
      id: string;
      subject: string | null;
      body: string;
      visibility: MessageVisibility;
      isRead: boolean;
      createdAt: Date;
      parentMessageId: string | null;
      serviceRequestId: string | null;
      jobId: string | null;
      sender: { id: string; firstName: string; lastName: string; role: UserRole };
      replies?: never[];
    }>;
  },
  extras?: { contextLabel?: string; contextReference?: string },
): SerializedMessage {
  return {
    id: message.id,
    subject: message.subject,
    body: message.body,
    visibility: message.visibility,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
    parentMessageId: message.parentMessageId,
    serviceRequestId: message.serviceRequestId,
    jobId: message.jobId,
    sender: message.sender,
    replies: (message.replies ?? [])
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((reply) => serializeMessage(reply)),
    contextLabel: extras?.contextLabel,
    contextReference: extras?.contextReference,
  };
}

export async function listThreadsForUser(user: User) {
  const visibilities = visibleVisibilitiesForRole(user.role);
  const contexts = await getAccessibleContexts(user);
  const requestIds = contexts.requests.map((request) => request.id);
  const jobIds = contexts.jobs.map((job) => job.id);

  if (requestIds.length === 0 && jobIds.length === 0) {
    return { threads: [], contexts };
  }

  const threads = await db.message.findMany({
    where: {
      parentMessageId: null,
      visibility: { in: visibilities },
      OR: [
        ...(requestIds.length ? [{ serviceRequestId: { in: requestIds } }] : []),
        ...(jobIds.length ? [{ jobId: { in: jobIds } }] : []),
      ],
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      replies: {
        where: { visibility: { in: visibilities } },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      serviceRequest: { select: { title: true, referenceNumber: true } },
      job: { select: { title: true, referenceNumber: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    contexts,
    threads: threads.map((thread) =>
      serializeMessage(thread, {
        contextLabel: thread.job?.title ?? thread.serviceRequest?.title ?? "General",
        contextReference: thread.job?.referenceNumber ?? thread.serviceRequest?.referenceNumber ?? undefined,
      }),
    ),
  };
}

export async function getThreadForUser(user: User, threadId: string) {
  const root = await canAccessMessage(user, threadId);
  if (!root || root.parentMessageId) return null;

  const visibilities = visibleVisibilitiesForRole(user.role);
  const thread = await db.message.findUnique({
    where: { id: threadId },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      replies: {
        where: { visibility: { in: visibilities } },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      serviceRequest: { select: { title: true, referenceNumber: true } },
      job: { select: { title: true, referenceNumber: true } },
    },
  });

  if (!thread) return null;

  return serializeMessage(thread, {
    contextLabel: thread.job?.title ?? thread.serviceRequest?.title ?? "General",
    contextReference: thread.job?.referenceNumber ?? thread.serviceRequest?.referenceNumber ?? undefined,
  });
}
