import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      const invoice = await db.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        },
      });

      await createAuditLog({
        jobId: invoice.jobId,
        action: "INVOICE_PAID",
        entityType: "Invoice",
        entityId: invoice.id,
        newValue: {
          stripeCheckoutSessionId: session.id,
          amountTotal: session.amount_total,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
