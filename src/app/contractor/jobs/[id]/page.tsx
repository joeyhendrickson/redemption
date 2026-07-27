import { redirect, notFound } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { JOB_STATUS_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ContractorJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["CONTRACTOR"]);
  if (!user) redirect("/login");

  const { id } = await params;
  const job = await db.job.findFirst({
    where: { id, contractorId: user.id },
    include: { tasks: { orderBy: { sortOrder: "asc" } }, files: true },
  });

  if (!job) notFound();

  return (
    <PortalShell role="CONTRACTOR" title={job.title} userName={`${user.firstName} ${user.lastName}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>{job.title}</CardTitle>
              <Badge>{JOB_STATUS_LABELS[job.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{job.description}</p>
            <Progress value={job.completionPercentage} />
            <p className="text-sm text-muted-foreground">{job.completionPercentage}% complete</p>
            <div>
              <p className="font-medium">Tasks</p>
              <ul className="mt-2 space-y-2">
                {job.tasks.map((task) => (
                  <li key={task.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{task.title}</span>
                      <span>{task.progressPercentage}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Job Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Address:</strong> {job.serviceAddress}</p>
            <p><strong>Access:</strong> {job.accessInstructions ?? "None provided"}</p>
            <p><strong>Safety notes:</strong> {job.safetyNotes ?? "None provided"}</p>
            <p><strong>Photos:</strong> {job.files.length}</p>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
