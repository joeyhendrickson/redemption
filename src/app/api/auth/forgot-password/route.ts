import { NextResponse } from "next/server";
import { sendPasswordResetCode } from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validations";

const successMessage =
  "If an account exists for that email, a reset code has been sent. Check your inbox and spam folder.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
        { status: 400 },
      );
    }

    try {
      await sendPasswordResetCode({ email: parsed.data.email, request });
    } catch (error) {
      console.error("[forgot-password]", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to send password reset email." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: successMessage });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process request." },
      { status: 500 },
    );
  }
}
