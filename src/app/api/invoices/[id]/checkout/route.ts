import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoiceReadyEmail, sendEmail } from "@/lib/email";
import { getInvoiceForUser, serializeInvoice } from "@/lib/invoices";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const { id } = await params;
  const invoice = await getInvoiceForUser(user, id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === "PAID") {
    return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.job.serviceRequest.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(invoice.total) * 100),
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: invoice.notes ?? `Payment for job ${invoice.job.referenceNumber}`,
          },
        },
      },
    ],
    metadata: {
      invoiceId: invoice.id,
      jobId: invoice.jobId,
    },
    success_url: `${appUrl}/customer/jobs/${invoice.jobId}?paid=1`,
    cancel_url: `${appUrl}/customer/jobs/${invoice.jobId}?paid=0`,
  });

  await db.invoice.update({
    where: { id: invoice.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  if (user.role === "ADMIN") {
    await sendEmail({
      to: invoice.job.serviceRequest.email,
      ...invoiceReadyEmail({
        name: invoice.job.serviceRequest.firstName,
        invoiceNumber: invoice.invoiceNumber,
        total: `$${Number(invoice.total).toFixed(2)}`,
        payUrl: session.url ?? `${appUrl}/customer/jobs/${invoice.jobId}`,
      }),
    });
  }

  return NextResponse.json({
    checkoutUrl: session.url,
    invoice: serializeInvoice({ ...invoice, stripeCheckoutSessionId: session.id }),
  });
}
