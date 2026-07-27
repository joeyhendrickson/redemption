import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Progress } from "@/components/ui/progress";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOB_STATUS_LABELS, REQUEST_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  const [requests, jobs, messages] = await Promise.all([
    db.serviceRequest.findMany({
      where: { customerId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.job.findMany({
      where: { customerId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { contractor: true },
    }),
    db.message.findMany({
      where: {
        OR: [
          { serviceRequest: { customerId: user.id } },
          { job: { customerId: user.id } },
        ],
        visibility: "CUSTOMER",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <PortalShell role="CUSTOMER" title="Customer Portal" userName={`${user.firstName} ${user.lastName}`}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Requests</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{requests.filter((r) => !["CANCELLED", "ARCHIVED", "CONVERTED_TO_JOB"].includes(r.status)).length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Jobs</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{jobs.filter((j) => !["CLOSED", "CANCELLED", "COMPLETED"].includes(j.status)).length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Recent Messages</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{messages.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed Jobs</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{jobs.filter((j) => ["COMPLETED", "CLOSED"].includes(j.status)).length}</CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Requests</CardTitle>
            <ButtonLink variant="outline" size="sm" href="/customer/requests">View all</ButtonLink>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet. <Link href="/#request-service" className="underline">Submit a request</Link></p>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{request.title}</p>
                    <Badge variant="secondary">{REQUEST_STATUS_LABELS[request.status]}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{request.referenceNumber}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Jobs</CardTitle>
            <ButtonLink variant="outline" size="sm" href="/customer/jobs">View all</ButtonLink>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No jobs yet.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{job.title}</p>
                    <Badge variant="secondary">{JOB_STATUS_LABELS[job.status]}</Badge>
                  </div>
                  <Progress className="mt-3" value={job.completionPercentage} />
                  <p className="mt-2 text-xs text-muted-foreground">{job.completionPercentage}% complete</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
