import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CustomerMessagesPage() {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) redirect("/login");

  return (
    <PortalShell role="CUSTOMER" title="Messages" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Threaded messaging with your project team will appear here.
        </CardContent>
      </Card>
    </PortalShell>
  );
}
