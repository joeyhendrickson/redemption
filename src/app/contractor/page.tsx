import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOB_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ContractorDashboardPage() {
  const user = await requireRole(["CONTRACTOR"]);
  if (!user) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayJobs, upcomingJobs, awaitingUpdates] = await Promise.all([
    db.job.findMany({
      where: {
        contractorId: user.id,
        scheduledStart: { gte: today, lt: new Date(today.getTime() + 86400000) },
      },
      orderBy: { scheduledStart: "asc" },
    }),
    db.job.findMany({
      where: {
        contractorId: user.id,
        scheduledStart: { gt: new Date(today.getTime() + 86400000) },
        status: { in: ["ASSIGNED", "SCHEDULED", "CONFIRMED", "IN_PROGRESS"] },
      },
      orderBy: { scheduledStart: "asc" },
      take: 5,
    }),
    db.job.findMany({
      where: {
        contractorId: user.id,
        status: { in: ["IN_PROGRESS", "WAITING_ON_CUSTOMER", "WAITING_ON_MATERIALS"] },
      },
      take: 5,
    }),
  ]);

  return (
    <PortalShell role="CONTRACTOR" title="Contractor Portal" userName={`${user.firstName} ${user.lastName}`}>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today&apos;s Jobs</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{todayJobs.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Upcoming</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{upcomingJobs.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Awaiting Updates</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{awaitingUpdates.length}</CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Today&apos;s Schedule</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {todayJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs scheduled for today.</p>
            ) : (
              todayJobs.map((job) => (
                <Link key={job.id} href={`/contractor/jobs/${job.id}`} className="block rounded-lg border p-4 hover:bg-muted/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{job.title}</p>
                    <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{job.serviceAddress}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Jobs Needing Updates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {awaitingUpdates.map((job) => (
              <Link key={job.id} href={`/contractor/jobs/${job.id}`} className="block rounded-lg border p-4 hover:bg-muted/40">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">{JOB_STATUS_LABELS[job.status]}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
