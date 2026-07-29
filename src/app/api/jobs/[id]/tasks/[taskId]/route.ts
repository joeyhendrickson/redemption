import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { canAccessJob, recalculateJobProgress, serializeJob, serializeTask } from "@/lib/jobs";
import { db } from "@/lib/db";
import { taskUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, taskId } = await params;
  const job = await canAccessJob(user, id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (user.role === "CONTRACTOR" && job.contractorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingTask = await db.task.findFirst({ where: { id: taskId, jobId: id } });
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid task update" }, { status: 400 });
  }

  const data = parsed.data;

  if (user.role === "CONTRACTOR") {
    if (data.weight !== undefined || data.title !== undefined) {
      return NextResponse.json({ error: "Contractors cannot rename tasks or change weights" }, { status: 403 });
    }
  }

  let progressPercentage = data.progressPercentage;
  let status = data.status;
  let completedAt = existingTask.completedAt;

  if (status === "COMPLETED") {
    progressPercentage = 100;
    completedAt = new Date();
  } else if (progressPercentage === 100) {
    status = "COMPLETED";
    completedAt = new Date();
  } else if (progressPercentage != null && progressPercentage > 0 && !status) {
    status = "IN_PROGRESS";
  }

  if (status === "BLOCKED" && !data.blockerReason && !existingTask.blockerReason) {
    return NextResponse.json({ error: "Blocker reason is required" }, { status: 400 });
  }

  const task = await db.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      status,
      progressPercentage,
      weight: data.weight,
      estimatedHours: data.estimatedHours,
      actualHours: data.actualHours,
      materialsRequired: data.materialsRequired,
      blockerReason: data.blockerReason,
      completedAt,
    },
  });

  await recalculateJobProgress(id);

  await createAuditLog({
    userId: user.id,
    jobId: id,
    action: "TASK_UPDATED",
    entityType: "Task",
    entityId: taskId,
    previousValue: {
      status: existingTask.status,
      progressPercentage: existingTask.progressPercentage,
    },
    newValue: {
      status: task.status,
      progressPercentage: task.progressPercentage,
    },
  });

  const refreshed = await canAccessJob(user, id);
  return NextResponse.json({
    task: serializeTask(task),
    job: refreshed ? serializeJob(refreshed) : null,
  });
}
