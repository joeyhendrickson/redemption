import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JOB_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const jobs = await db.job.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
        include: { contractor: true, tasks: { select: { id: true, status: true } } },
  });

  return (
    <PortalShell role="ADMIN" title="Jobs" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>All Jobs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs yet. Approve an estimate to create one.</p>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.id}
                href={`/admin/jobs/${job.id}`}
                className="block rounded-lg border p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.referenceNumber}</p>
                  </div>
                  <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
                </div>
                <Progress className="mt-3" value={job.completionPercentage} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Contractor: {job.contractor ? `${job.contractor.firstName} ${job.contractor.lastName}` : "Unassigned"}
                </p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
