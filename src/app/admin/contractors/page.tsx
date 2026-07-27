import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminContractorsPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const users = await db.user.findMany({
    where: { role: "CONTRACTOR" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { contractorProfile: true },
  });

  return (
    <PortalShell role="ADMIN" title="Contractors" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Contractors</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {users.map((entry) => (
            <div key={entry.id} className="rounded-lg border p-4">
              <p className="font-medium">{entry.firstName} {entry.lastName}</p>
              <p className="text-sm text-muted-foreground">{entry.email}</p>
              {entry.contractorProfile?.title ? (
                <p className="text-sm text-muted-foreground">{entry.contractorProfile.title}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
