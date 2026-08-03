import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { User, UserRole } from "@/generated/prisma/client";

function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /DATABASE_URL is not set|P1001|Can't reach database|connection terminated|ECONNREFUSED/i.test(
    error.message,
  );
}

type AuthUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

function getAuthName(authUser: AuthUser, field: string) {
  const value = authUser.user_metadata?.[field];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function resolveRole(authUser: AuthUser): UserRole {
  const metadataRole = authUser.user_metadata?.role;
  if (metadataRole === "ADMIN") return "ADMIN";
  if (metadataRole === "CONTRACTOR") return "CONTRACTOR";
  return "CUSTOMER";
}

async function loadUserWithProfiles(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
      contractorProfile: true,
    },
  });
}

async function linkCustomerServiceRequests(userId: string, email: string) {
  await db.serviceRequest.updateMany({
    where: { email, customerId: null },
    data: { customerId: userId },
  });
}

async function provisionAppUserFromAuth(authUser: AuthUser) {
  if (!authUser.email) return null;

  const email = authUser.email.toLowerCase();
  const role = resolveRole(authUser);
  const firstName = getAuthName(authUser, "firstName") ?? email.split("@")[0] ?? "Customer";
  const lastName = getAuthName(authUser, "lastName") ?? "";
  const phone =
    typeof authUser.user_metadata?.phone === "string" ? authUser.user_metadata.phone : undefined;
  const emailVerified = Boolean(authUser.email_confirmed_at);

  const existingByEmail = await db.user.findUnique({ where: { email } });
  if (existingByEmail) {
    const updated = await db.user.update({
      where: { email },
      data: {
        supabaseId: authUser.id,
        firstName: existingByEmail.firstName || firstName,
        lastName: existingByEmail.lastName || lastName,
        emailVerified: emailVerified || existingByEmail.emailVerified,
        isActive: true,
      },
    });

    if (updated.role === "CUSTOMER") {
      await db.customerProfile.upsert({
        where: { userId: updated.id },
        update: {},
        create: { userId: updated.id },
      });
      await linkCustomerServiceRequests(updated.id, email);
    }

    return updated;
  }

  const created = await db.user.create({
    data: {
      supabaseId: authUser.id,
      email,
      firstName,
      lastName,
      phone,
      role,
      emailVerified,
      isActive: true,
      ...(role === "CUSTOMER" ? { customerProfile: { create: {} } } : {}),
      ...(role === "CONTRACTOR" ? { contractorProfile: { create: {} } } : {}),
    },
  });

  if (role === "CUSTOMER") {
    await linkCustomerServiceRequests(created.id, email);
  }

  return created;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  try {
    let user = await db.user.findUnique({
      where: { supabaseId: authUser.id },
      include: {
        customerProfile: true,
        contractorProfile: true,
      },
    });

    if (!user && authUser.email) {
      user = await db.user.findUnique({
        where: { email: authUser.email.toLowerCase() },
        include: {
          customerProfile: true,
          contractorProfile: true,
        },
      });

      if (user && user.supabaseId !== authUser.id) {
        user = await db.user.update({
          where: { id: user.id },
          data: { supabaseId: authUser.id },
          include: {
            customerProfile: true,
            contractorProfile: true,
          },
        });
      }
    }

    if (!user) {
      const provisioned = await provisionAppUserFromAuth(authUser);
      if (provisioned) {
        user = await loadUserWithProfiles(provisioned.id);
      }
    }

    return user;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      throw error;
    }
    console.error("[auth] getCurrentUser failed", error);
    return null;
  }
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}

export function roleDashboardPath(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CONTRACTOR":
      return "/contractor";
    case "CUSTOMER":
      return "/customer";
    default:
      return "/";
  }
}
