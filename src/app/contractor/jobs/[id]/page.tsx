import { redirect, notFound } from "next/navigation";
import { PortalShell } from "@/components/layout/portal-shell";
import { ContractorTaskPanel } from "@/components/jobs/contractor-task-panel";
import { FileManager } from "@/components/files/file-manager";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ButtonLink } from "@/components/ui/button-link";

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
    select: { id: true },
  });

  if (!job) notFound();

  return (
    <PortalShell role="CONTRACTOR" title="Job Tasks" userName={`${user.firstName} ${user.lastName}`}>
      <div className="mb-6">
        <ButtonLink variant="outline" href="/contractor/jobs">Back to jobs</ButtonLink>
      </div>
      <ContractorTaskPanel jobId={job.id} />
      <div className="mt-8 rounded-lg border bg-card p-6">
        <FileManager jobId={job.id} allowReceipts title="Job Photos, Receipts & Documents" />
      </div>
    </PortalShell>
  );
}
