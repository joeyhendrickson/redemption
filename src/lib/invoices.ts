import { db } from "@/lib/db";
import { canAccessJob } from "@/lib/jobs";
import type { User } from "@/generated/prisma/client";

function generateInvoiceNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  return `INV-${stamp}`;
}

export async function listJobInvoices(user: User, jobId: string) {
  const job = await canAccessJob(user, jobId);
  if (!job) return null;

  return db.invoice.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
}

export function serializeInvoice(invoice: {
  id: string;
  jobId: string;
  invoiceNumber: string;
  status: string;
  subtotal: unknown;
  tax: unknown;
  total: unknown;
  dueDate: Date | null;
  sentAt: Date | null;
  paidAt: Date | null;
  notes: string | null;
  stripeCheckoutSessionId: string | null;
  createdAt: Date;
}) {
  return {
    id: invoice.id,
    jobId: invoice.jobId,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    subtotal: Number(invoice.subtotal),
    tax: Number(invoice.tax),
    total: Number(invoice.total),
    dueDate: invoice.dueDate?.toISOString() ?? null,
    sentAt: invoice.sentAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    notes: invoice.notes,
    stripeCheckoutSessionId: invoice.stripeCheckoutSessionId,
    createdAt: invoice.createdAt.toISOString(),
  };
}

export async function createJobInvoice({
  jobId,
  subtotal,
  tax = 0,
  notes,
  dueDate,
}: {
  jobId: string;
  subtotal: number;
  tax?: number;
  notes?: string;
  dueDate?: string;
}) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { serviceRequest: { select: { email: true, firstName: true, lastName: true, phone: true } } },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const total = subtotal + tax;

  return db.invoice.create({
    data: {
      jobId,
      invoiceNumber: generateInvoiceNumber(),
      status: "SENT",
      subtotal,
      tax,
      total,
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      sentAt: new Date(),
    },
  });
}

export async function getInvoiceForUser(user: User, invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      job: {
        include: {
          serviceRequest: { select: { email: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!invoice) return null;

  const job = await canAccessJob(user, invoice.jobId);
  if (!job) return null;

  return invoice;
}
