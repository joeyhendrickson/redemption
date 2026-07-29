import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { MessagingInbox } from "@/components/messaging/messaging-inbox";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ContractorMessagesPage() {
  const user = await requireRole(["CONTRACTOR"]);
  if (!user) redirect("/login");

  return (
    <PortalShell role="CONTRACTOR" title="Messages" userName={`${user.firstName} ${user.lastName}`}>
      <MessagingInbox role="CONTRACTOR" userId={user.id} />
    </PortalShell>
  );
}
