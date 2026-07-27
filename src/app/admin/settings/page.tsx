import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { requireRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");
  const settings = await getSiteSettings();

  return (
    <PortalShell role="ADMIN" title="Site Settings" userName={`${user.firstName} ${user.lastName}`}>
      <SiteSettingsForm initialSettings={settings as unknown as Record<string, string | null>} />
    </PortalShell>
  );
}
