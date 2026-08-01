import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { deliverAccountVerificationEmail } from "@/lib/auth-verification";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists for that email, a verification link has been sent.",
      });
    }

    await deliverAccountVerificationEmail({
      to: email,
      name: user.firstName,
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Verification email sent. Check your inbox and spam folder.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send verification email." },
      { status: 500 },
    );
  }
}
