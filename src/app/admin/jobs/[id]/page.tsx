import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { JobAdminPanel } from "@/components/jobs/job-admin-panel";
import { InvoicePanel } from "@/components/invoices/invoice-panel";
import { ReviewAdminPanel } from "@/components/reviews/review-admin-panel";
import { requireRole } from "@/lib/auth";
import { canAccessJob } from "@/lib/jobs";
import { db } from "@/lib/db";
import { JOB_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamic = "force-dynamic";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await canAccessJob(user, id);
  if (!job) notFound();

  const contractors = await db.user.findMany({
    where: { role: "CONTRACTOR", isActive: true },
    orderBy: { lastName: "asc" },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  return (
    <PortalShell role="ADMIN" title="Job Detail" userName={`${user.firstName} ${user.lastName}`}>
      <div className="mb-6">
        <ButtonLink variant="outline" href="/admin/jobs">Back to jobs</ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{job.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{job.referenceNumber}</p>
              </div>
              <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Address:</strong> {job.serviceAddress}, {job.city}, {job.state} {job.zipCode}</p>
            <p><strong>Request:</strong> {job.serviceRequest.referenceNumber}</p>
            {job.accessInstructions ? <p><strong>Access:</strong> {job.accessInstructions}</p> : null}
            {job.safetyNotes ? <p><strong>Safety:</strong> {job.safetyNotes}</p> : null}
            {job.propertyNotes ? <p><strong>Property notes:</strong> {job.propertyNotes}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment & Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <JobAdminPanel jobId={job.id} contractors={contractors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Review</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewAdminPanel jobId={job.id} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicePanel jobId={job.id} mode="admin" />
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
