import { redirect } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { AdminAnalyticsChart } from "@/components/admin/analytics-chart";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { JOB_STATUS_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const jobsByStatus = await db.job.groupBy({ by: ["status"], _count: { status: true } });
  const chartData = jobsByStatus.map((item) => ({
    status: JOB_STATUS_LABELS[item.status] ?? item.status,
    count: item._count.status,
  }));

  return (
    <PortalShell role="ADMIN" title="Analytics" userName={`${user.firstName} ${user.lastName}`}>
      <Card>
        <CardHeader><CardTitle>Operations Overview</CardTitle></CardHeader>
        <CardContent><AdminAnalyticsChart data={chartData} /></CardContent>
      </Card>
    </PortalShell>
  );
}
