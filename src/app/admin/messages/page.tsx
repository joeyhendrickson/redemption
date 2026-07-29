import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { MessagingInbox } from "@/components/messaging/messaging-inbox";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  return (
    <PortalShell role="ADMIN" title="Messages" userName={`${user.firstName} ${user.lastName}`}>
      <MessagingInbox role="ADMIN" userId={user.id} />
    </PortalShell>
  );
}
