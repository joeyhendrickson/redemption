import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { sendEmail, accountVerificationEmail } from "@/lib/email";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { firstName, lastName, email, phone, password, serviceRequestId } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const supabase = getServiceClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { firstName, lastName, role: "CUSTOMER" },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Registration failed" }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        supabaseId: authData.user.id,
        email,
        firstName,
        lastName,
        phone,
        role: "CUSTOMER",
        customerProfile: { create: {} },
      },
    });

    if (serviceRequestId) {
      await db.serviceRequest.updateMany({
        where: { id: serviceRequestId, email },
        data: { customerId: user.id },
      });
    }

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login?verify=1`;
    const emailContent = accountVerificationEmail({ name: firstName, verifyUrl });
    await sendEmail({ to: email, subject: emailContent.subject, html: emailContent.html });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
