import { NextResponse } from "next/server";
import { sendPasswordResetCode } from "@/lib/password-reset";
import { forgotPasswordSchema } from "@/lib/validations";

const genericSuccessMessage =
  "If an account exists for that email, password reset instructions have been sent. Check your inbox and spam folder.";

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

    let result;
    try {
      result = await sendPasswordResetCode({ email: parsed.data.email, request });
    } catch (error) {
      console.error("[forgot-password]", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to send password reset email." },
        { status: 500 },
      );
    }

    if (!result.sent) {
      return NextResponse.json({ success: true, message: genericSuccessMessage });
    }

    const message =
      result.delivery === "code"
        ? "A 6-digit reset code has been sent to your email. Check your inbox and spam folder."
        : "A password reset link has been sent to your email. Open the link, then choose a new password.";

    return NextResponse.json({
      success: true,
      delivery: result.delivery,
      message,
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process request." },
      { status: 500 },
    );
  }
}
