import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CustomerRequestsPage() {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) redirect("/login");

  const requests = await db.serviceRequest.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PortalShell role="CUSTOMER" title="My Requests" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Service Requests</CardTitle>
          <Link href="/#request-service" className="text-sm underline">New request</Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{request.title}</p>
                <Badge variant="secondary">{REQUEST_STATUS_LABELS[request.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{request.referenceNumber}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
