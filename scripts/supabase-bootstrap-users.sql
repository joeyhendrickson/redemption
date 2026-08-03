-- Run this in Supabase SQL Editor if the full init script already partially ran.
-- Safe to run multiple times.

-- Admin: joeyhendrickson@me.com
INSERT INTO "User" (
  "id",
  "supabaseId",
  "email",
  "firstName",
  "lastName",
  "role",
  "isActive",
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin-joeyhendrickson',
  '6580b942-f813-4327-861e-30ec0328a8ff',
  'joeyhendrickson@me.com',
  'Joe',
  'Hendrickson',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT ("email") DO UPDATE SET
  "supabaseId" = EXCLUDED."supabaseId",
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "role" = 'ADMIN',
  "isActive" = true,
  "emailVerified" = true,
  "updatedAt" = NOW();

-- Optional: confirm core tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('User', 'ServiceRequest', 'SiteSettings')
ORDER BY table_name;
