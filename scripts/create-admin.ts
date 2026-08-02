import { config } from "dotenv";
import { randomUUID } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";
import { resolveDatabaseUrl } from "../src/lib/database-url";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const rawAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const firstName = process.env.ADMIN_FIRST_NAME ?? "Admin";
const lastName = process.env.ADMIN_LAST_NAME ?? "User";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!rawAdminEmail || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  process.exit(1);
}

const adminEmail: string = rawAdminEmail;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase URL and service role key.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findAuthUserByEmail(targetEmail: string) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl(process.env.DATABASE_URL);
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function upsertAdminUser(authUserId: string) {
  if (process.env.DATABASE_URL) {
    const prisma = createPrismaClient();

    try {
      const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
          supabaseId: authUserId,
          firstName,
          lastName,
          role: "ADMIN",
          emailVerified: true,
          isActive: true,
        },
        create: {
          supabaseId: authUserId,
          email: adminEmail,
          firstName,
          lastName,
          role: "ADMIN",
          emailVerified: true,
          isActive: true,
        },
      });

      console.log(`App user record set to ADMIN (${user.id}).`);
      return;
    } finally {
      await prisma.$disconnect();
    }
  }

  const { data: existingUser, error: lookupError } = await supabase
    .from("User")
    .select("id")
    .eq("email", adminEmail)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingUser) {
    const { error: updateError } = await supabase
      .from("User")
      .update({
        supabaseId: authUserId,
        firstName,
        lastName,
        role: "ADMIN",
        emailVerified: true,
        isActive: true,
      })
      .eq("id", existingUser.id);

    if (updateError) throw updateError;
    console.log(`App user record updated to ADMIN (${existingUser.id}).`);
    return;
  }

  const { error: insertError } = await supabase.from("User").insert({
    id: randomUUID(),
    supabaseId: authUserId,
    email: adminEmail,
    firstName,
    lastName,
    role: "ADMIN",
    emailVerified: true,
    isActive: true,
  });

  if (insertError) throw insertError;
  console.log("App user record created with ADMIN role.");
}

async function main() {
  let authUser = await findAuthUserByEmail(adminEmail);

  if (authUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: { firstName, lastName, role: "ADMIN" },
    });

    if (error) throw error;
    authUser = data.user;
    console.log(`Updated Supabase auth user: ${adminEmail}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
      user_metadata: { firstName, lastName, role: "ADMIN" },
    });

    if (error) throw error;
    authUser = data.user;
    console.log(`Created Supabase auth user: ${adminEmail}`);
  }

  if (!authUser) {
    throw new Error("Auth user was not returned.");
  }

  await upsertAdminUser(authUser.id);
  console.log("Admin setup complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
