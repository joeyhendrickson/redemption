import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ButtonLink } from "@/components/ui/button-link";
import { JOB_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CustomerJobsPage() {
  const user = await requireRole(["CUSTOMER"]);
  if (!user) redirect("/login");

  const jobs = await db.job.findMany({
    where: { customerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { contractor: true, tasks: true },
  });

  return (
    <PortalShell role="CUSTOMER" title="My Jobs" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Jobs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.referenceNumber}</p>
                </div>
                <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
              </div>
              <Progress className="mt-3" value={job.completionPercentage} />
              <p className="mt-2 text-sm text-muted-foreground">
                Contractor: {job.contractor ? `${job.contractor.firstName} ${job.contractor.lastName}` : "Pending assignment"}
              </p>
              <ButtonLink href={`/customer/jobs/${job.id}`} variant="outline" className="mt-4">
                View job
              </ButtonLink>
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
