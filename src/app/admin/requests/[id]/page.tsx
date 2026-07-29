import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { EstimateAdminPanel } from "@/components/estimates/estimate-admin-panel";
import { FileManager } from "@/components/files/file-manager";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const { id } = await params;
  const request = await db.serviceRequest.findUnique({
    where: { id },
    include: {
      job: true,
      estimates: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!request) notFound();

  return (
    <PortalShell role="ADMIN" title="Request Detail" userName={`${user.firstName} ${user.lastName}`}>
      <div className="mb-6">
        <ButtonLink variant="outline" href="/admin/requests">Back to requests</ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{request.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{request.referenceNumber}</p>
              </div>
              <Badge variant={request.isEmergencyFlagged ? "destructive" : "secondary"}>
                {REQUEST_STATUS_LABELS[request.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Customer:</strong> {request.firstName} {request.lastName}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Phone:</strong> {request.phone}</p>
            <p><strong>Address:</strong> {request.serviceAddress}, {request.city}, {request.state} {request.zipCode}</p>
            <p><strong>Service:</strong> {request.serviceCategory}</p>
            <p><strong>Description:</strong> {request.description}</p>
            {request.job ? (
              <p>
                <strong>Linked job:</strong>{" "}
                <Link href={`/admin/jobs`} className="underline">{request.job.referenceNumber}</Link>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimate Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateAdminPanel serviceRequestId={request.id} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <FileManager serviceRequestId={request.id} />
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
