import { notFound, redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { FileManager } from "@/components/files/file-manager";
import { InvoicePanel } from "@/components/invoices/invoice-panel";
import { PostCompletionReviewPanel } from "@/components/reviews/post-completion-review-panel";
import { requireRole } from "@/lib/auth";
import { canAccessJob } from "@/lib/jobs";
import { JOB_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamic = "force-dynamic";

export default async function CustomerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await canAccessJob(user, id);
  if (!job) notFound();

  return (
    <PortalShell role="CUSTOMER" title="Job Detail" userName={`${user.firstName} ${user.lastName}`}>
      <div className="mb-6">
        <ButtonLink variant="outline" href="/customer/jobs">Back to jobs</ButtonLink>
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
          <CardContent className="space-y-4">
            <Progress value={job.completionPercentage} />
            <p className="text-sm text-muted-foreground">{job.completionPercentage}% complete</p>
            <div className="space-y-2 text-sm">
              <p><strong>Address:</strong> {job.serviceAddress}, {job.city}, {job.state} {job.zipCode}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p>
                <strong>Contractor:</strong>{" "}
                {job.contractor
                  ? `${job.contractor.firstName} ${job.contractor.lastName}`
                  : "Pending assignment"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post-Completion Review</CardTitle>
          </CardHeader>
          <CardContent>
            <PostCompletionReviewPanel jobId={job.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicePanel jobId={job.id} mode="customer" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
          </CardHeader>
          <CardContent>
            <FileManager jobId={job.id} />
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
