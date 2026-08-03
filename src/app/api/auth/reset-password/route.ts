import { NextResponse } from "next/server";
import { resetPasswordWithCode } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const { email, code, password } = parsed.data;

    await resetPasswordWithCode({ email, code, password });

    return NextResponse.json({
      success: true,
      message: "Your password has been updated. You can sign in now.",
    });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to reset password." },
      { status: 400 },
    );
  }
}
