import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { assignContractorToJob, canAccessJob, serializeJob } from "@/lib/jobs";
import { assignContractorSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await canAccessJob(admin, id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = assignContractorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid assignment" }, { status: 400 });
  }

  try {
    const updated = await assignContractorToJob({
      jobId: id,
      contractorId: parsed.data.contractorId,
      adminUserId: admin.id,
    });
    return NextResponse.json({ job: serializeJob(updated) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to assign contractor" },
      { status: 400 },
    );
  }
}
