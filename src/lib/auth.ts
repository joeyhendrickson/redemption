import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { UserRole } from "@/generated/prisma/client";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const user = await db.user.findUnique({
    where: { supabaseId: authUser.id },
    include: {
      customerProfile: true,
      contractorProfile: true,
    },
  });

  return user;
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
