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
    where: {
      OR: [{ customerId: user.id }, { email: user.email }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      estimates: {
        where: { status: "SENT" },
        select: { id: true },
      },
    },
  });

  return (
    <PortalShell role="CUSTOMER" title="My Requests" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Service Requests</CardTitle>
          <Link href="/#request-service" className="text-sm underline">New request</Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No requests yet. <Link href="/#request-service" className="underline">Submit a service request</Link>
            </p>
          ) : (
            requests.map((request) => (
              <Link
                key={request.id}
                href={`/customer/requests/${request.id}`}
                className="block rounded-lg border p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{request.title}</p>
                  <div className="flex items-center gap-2">
                    {request.estimates.length > 0 ? (
                      <Badge>Estimate ready</Badge>
                    ) : null}
                    <Badge variant="secondary">{REQUEST_STATUS_LABELS[request.status]}</Badge>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{request.referenceNumber}</p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
