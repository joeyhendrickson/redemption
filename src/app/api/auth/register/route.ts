import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { deliverAccountVerificationEmail } from "@/lib/auth-verification";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

function getServiceClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
}

function getDatabaseErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "ECONNREFUSED") {
    return "Database connection failed. Start the local database with npm run db:dev, or set DATABASE_URL in .env.local.";
  }

  if (error instanceof Error && /connection terminated|ECONNREFUSED|DATABASE_URL is not set/i.test(error.message)) {
    return "Database connection failed. Start the local database with npm run db:dev, or set DATABASE_URL in .env.local.";
  }

  return null;
}

export async function POST(request: Request) {
  let createdAuthUserId: string | null = null;
  let createdDbUserId: string | null = null;
  const supabase = getServiceClient();

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { firstName, lastName, email, phone, password, serviceRequestId } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: { firstName, lastName, role: "CUSTOMER" },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Registration failed" }, { status: 400 });
    }

    createdAuthUserId = authData.user.id;

    const user = await db.user.create({
      data: {
        supabaseId: authData.user.id,
        email: normalizedEmail,
        firstName,
        lastName,
        phone,
        role: "CUSTOMER",
        customerProfile: { create: {} },
      },
    });

    createdDbUserId = user.id;

    if (serviceRequestId) {
      await db.serviceRequest.updateMany({
        where: { id: serviceRequestId, email: normalizedEmail },
        data: { customerId: user.id },
      });
    }

    const emailDelivery = await deliverAccountVerificationEmail({
      to: normalizedEmail,
      name: firstName,
      request,
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      emailSent: true,
      emailProvider: emailDelivery.provider,
    });
  } catch (error) {
    if (createdDbUserId) {
      await db.user.delete({ where: { id: createdDbUserId } }).catch(() => undefined);
    }

    if (createdAuthUserId) {
      await supabase.auth.admin.deleteUser(createdAuthUserId).catch(() => undefined);
    }

    console.error(error);
    const databaseMessage = getDatabaseErrorMessage(error);
    if (databaseMessage) {
      return NextResponse.json({ error: databaseMessage }, { status: 503 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 },
    );
  }
}
