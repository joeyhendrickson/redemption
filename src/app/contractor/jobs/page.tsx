import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JOB_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ContractorJobsPage() {
  const user = await requireRole(["CONTRACTOR"]);
  if (!user) redirect("/login");

  const jobs = await db.job.findMany({
    where: { contractorId: user.id },
    orderBy: { scheduledStart: "asc" },
  });

  return (
    <PortalShell role="CONTRACTOR" title="Assigned Jobs" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Assigned Jobs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/contractor/jobs/${job.id}`} className="block rounded-lg border p-4 hover:bg-muted/40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{job.title}</p>
                <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{job.serviceAddress}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
