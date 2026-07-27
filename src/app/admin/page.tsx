import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { REQUEST_STATUS_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";
import { AdminAnalyticsChart } from "@/components/admin/analytics-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const [
    newRequests,
    activeJobs,
    emergencyRequests,
    customers,
    contractors,
    recentRequests,
    jobsByStatus,
  ] = await Promise.all([
    db.serviceRequest.count({ where: { status: "NEW" } }),
    db.job.count({ where: { status: { in: ["ASSIGNED", "SCHEDULED", "IN_PROGRESS", "QUALITY_REVIEW"] } } }),
    db.serviceRequest.count({ where: { isEmergencyFlagged: true, status: { notIn: ["ARCHIVED", "CANCELLED"] } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CONTRACTOR" } }),
    db.serviceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.job.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const chartData = jobsByStatus.map((item) => ({
    status: JOB_STATUS_LABELS[item.status] ?? item.status,
    count: item._count.status,
  }));

  return (
    <PortalShell role="ADMIN" title="Administrator Portal" userName={`${user.firstName} ${user.lastName}`}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "New Requests", value: newRequests },
          { label: "Active Jobs", value: activeJobs },
          { label: "Emergency Review", value: emergencyRequests },
          { label: "Customers", value: customers },
          { label: "Contractors", value: contractors },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{stat.label}</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{stat.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Requests</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-muted-foreground">{request.referenceNumber}</p>
                  </div>
                  <Badge variant={request.isEmergencyFlagged ? "destructive" : "secondary"}>
                    {REQUEST_STATUS_LABELS[request.status]}
                  </Badge>
                </div>
              </div>
            ))}
            <Link href="/admin/requests" className="text-sm underline">View all requests</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Jobs by Status</CardTitle></CardHeader>
          <CardContent>
            <AdminAnalyticsChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
