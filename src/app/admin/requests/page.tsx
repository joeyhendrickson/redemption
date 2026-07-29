import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const requests = await db.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      estimates: {
        where: { status: "SENT" },
        select: { id: true },
      },
    },
  });

  return (
    <PortalShell role="ADMIN" title="Service Requests" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Incoming Requests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/admin/requests/${request.id}`}
              className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{request.title}</p>
                <p className="text-sm text-muted-foreground">
                  {request.referenceNumber} · {request.firstName} {request.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {request.estimates.length > 0 ? (
                  <Badge>Awaiting approval</Badge>
                ) : null}
                <Badge variant={request.isEmergencyFlagged ? "destructive" : "secondary"}>
                  {REQUEST_STATUS_LABELS[request.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
