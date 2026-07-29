import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { MessagingInbox } from "@/components/messaging/messaging-inbox";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CustomerMessagesPage() {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) redirect("/login");

  return (
    <PortalShell role="CUSTOMER" title="Messages" userName={`${user.firstName} ${user.lastName}`}>
      <MessagingInbox role="CUSTOMER" userId={user.id} />
    </PortalShell>
  );
}
