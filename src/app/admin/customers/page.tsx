import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const users = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <PortalShell role="ADMIN" title="Customers" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Customers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-4">
              <p className="font-medium">{entry.firstName} {entry.lastName}</p>
              <p className="text-sm text-muted-foreground">{entry.email}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
