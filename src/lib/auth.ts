import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { User, UserRole } from "@/generated/prisma/client";

function getAuthName(authUser: { user_metadata?: Record<string, unknown> }, fallback: string) {
  const value = authUser.user_metadata?.[fallback];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function provisionAdminFromAuth(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  if (!authUser.email) return null;
  if (authUser.user_metadata?.role !== "ADMIN") {
    return null;
  }

  const email = authUser.email.toLowerCase();

  return db.user.upsert({
    where: { email },
    update: {
      supabaseId: authUser.id,
      firstName: getAuthName(authUser, "firstName") ?? "Joe",
      lastName: getAuthName(authUser, "lastName") ?? "Hendrickson",
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    },
    create: {
      supabaseId: authUser.id,
      email,
      firstName: getAuthName(authUser, "firstName") ?? "Joe",
      lastName: getAuthName(authUser, "lastName") ?? "Hendrickson",
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    },
  });
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

    if (!user) {
      const provisioned = await provisionAdminFromAuth(authUser);
      if (provisioned) {
        user = await db.user.findUnique({
          where: { id: provisioned.id },
          include: {
            customerProfile: true,
            contractorProfile: true,
          },
        });
      }
    }

    return user;
  } catch (error) {
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
