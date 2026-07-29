import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import {
  createJobInvoice,
  listJobInvoices,
  serializeInvoice,
} from "@/lib/invoices";
import { invoiceCreateSchema } from "@/lib/validations";

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

  const invoices = await listJobInvoices(user, jobId);
  if (!invoices) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    invoices: invoices.map(serializeInvoice),
  });
}

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = invoiceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid invoice" }, { status: 400 });
  }

  const invoice = await createJobInvoice(parsed.data);

  await createAuditLog({
    userId: admin.id,
    jobId: parsed.data.jobId,
    action: "INVOICE_CREATED",
    entityType: "Invoice",
    entityId: invoice.id,
    newValue: { invoiceNumber: invoice.invoiceNumber, total: Number(invoice.total) },
  });

  return NextResponse.json({ invoice: serializeInvoice(invoice) }, { status: 201 });
}
