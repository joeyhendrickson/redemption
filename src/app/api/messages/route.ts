import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  canAccessJob,
  canAccessMessage,
  canAccessServiceRequest,
  defaultVisibilityForRole,
  getThreadForUser,
  listThreadsForUser,
  serializeMessage,
  visibleVisibilitiesForRole,
} from "@/lib/messages";
import { messageSchema } from "@/lib/validations";
import type { MessageVisibility } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");

  if (threadId) {
    const thread = await getThreadForUser(user, threadId);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    await markThreadRead(user.id, threadId, user.role);

    return NextResponse.json({ thread });
  }

  const data = await listThreadsForUser(user);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message" }, { status: 400 });
  }

  const data = parsed.data;
  let serviceRequestId = data.serviceRequestId ?? null;
  let jobId = data.jobId ?? null;
  let parentMessageId = data.parentMessageId ?? null;
  let visibility: MessageVisibility = data.visibility ?? defaultVisibilityForRole(user.role);

  if (parentMessageId) {
    const parent = await canAccessMessage(user, parentMessageId);
    if (!parent) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    serviceRequestId = parent.serviceRequestId;
    jobId = parent.jobId;
    parentMessageId = parent.parentMessageId ?? parent.id;
    if (user.role !== "ADMIN") {
      visibility = defaultVisibilityForRole(user.role);
    }
  }

  if (serviceRequestId && !(await canAccessServiceRequest(user, serviceRequestId))) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (jobId && !(await canAccessJob(user, jobId))) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (user.role !== "ADMIN" && !visibleVisibilitiesForRole(user.role).includes(visibility)) {
    visibility = defaultVisibilityForRole(user.role);
  }

  const message = await db.message.create({
    data: {
      serviceRequestId,
      jobId,
      parentMessageId,
      senderId: user.id,
      subject: data.subject,
      body: data.body,
      visibility,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  return NextResponse.json({ message: serializeMessage(message) }, { status: 201 });
}

async function markThreadRead(userId: string, threadId: string, role: Parameters<typeof visibleVisibilitiesForRole>[0]) {
  const visibilities = visibleVisibilitiesForRole(role);
  await db.message.updateMany({
    where: {
      OR: [{ id: threadId }, { parentMessageId: threadId }],
      visibility: { in: visibilities },
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });
}
