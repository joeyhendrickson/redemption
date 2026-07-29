import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { EstimateApprovalPanel } from "@/components/estimates/estimate-approval-panel";
import { FileManager } from "@/components/files/file-manager";
import { requireRole } from "@/lib/auth";
import { canAccessServiceRequestForEstimate } from "@/lib/estimates";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamic = "force-dynamic";

export default async function CustomerRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) redirect("/login");

  const { id } = await params;
  const request = await canAccessServiceRequestForEstimate(user, id);
  if (!request) notFound();

  const pendingEstimate = request.estimates.some((estimate) => estimate.status === "SENT");

  return (
    <PortalShell role="CUSTOMER" title="Request Detail" userName={`${user.firstName} ${user.lastName}`}>
      <div className="mb-6">
        <ButtonLink variant="outline" href="/customer/requests">Back to requests</ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{request.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{request.referenceNumber}</p>
              </div>
              <Badge variant={pendingEstimate ? "default" : "secondary"}>
                {REQUEST_STATUS_LABELS[request.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Address:</strong> {request.serviceAddress}, {request.city}, {request.state} {request.zipCode}</p>
            <p><strong>Service:</strong> {request.serviceCategory}</p>
            <p><strong>Description:</strong> {request.description}</p>
            {request.job ? (
              <p><strong>Job:</strong> {request.job.referenceNumber}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <EstimateApprovalPanel serviceRequestId={request.id} />
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
