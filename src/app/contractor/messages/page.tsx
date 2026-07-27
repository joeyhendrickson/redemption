import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ContractorMessagesPage() {
  const user = await requireRole(["CONTRACTOR"]);
  if (!user) redirect("/login");

  return (
    <PortalShell role="CONTRACTOR" title="Messages" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Administrator and customer-visible messages will appear here.
        </CardContent>
      </Card>
    </PortalShell>
  );
}
