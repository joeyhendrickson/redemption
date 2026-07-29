import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { canAccessJob, recalculateJobProgress, serializeJob, serializeTask } from "@/lib/jobs";
import { db } from "@/lib/db";
import { taskSchema } from "@/lib/validations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await canAccessJob(user, id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ tasks: job.tasks.map(serializeTask) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(["ADMIN", "CONTRACTOR"]);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await canAccessJob(user, id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (user.role === "CONTRACTOR" && job.contractorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid task" }, { status: 400 });
  }

  const nextSortOrder = job.tasks.length;
  const task = await db.task.create({
    data: {
      jobId: id,
      title: parsed.data.title,
      description: parsed.data.description,
      weight: parsed.data.weight ?? 1,
      estimatedHours: parsed.data.estimatedHours,
      materialsRequired: parsed.data.materialsRequired,
      sortOrder: nextSortOrder,
    },
  });

  await recalculateJobProgress(id);

  await createAuditLog({
    userId: user.id,
    jobId: id,
    action: "TASK_CREATED",
    entityType: "Task",
    entityId: task.id,
    newValue: { title: task.title },
  });

  const refreshed = await canAccessJob(user, id);
  return NextResponse.json(
    { task: serializeTask(task), job: refreshed ? serializeJob(refreshed) : null },
    { status: 201 },
  );
}
