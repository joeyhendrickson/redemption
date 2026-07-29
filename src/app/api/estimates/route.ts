import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import {
  canAccessServiceRequestForEstimate,
  serializeEstimate,
} from "@/lib/estimates";
import { estimateSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const serviceRequestId = searchParams.get("serviceRequestId");

  if (!serviceRequestId) {
    return NextResponse.json({ error: "serviceRequestId is required" }, { status: 400 });
  }

  const serviceRequest = await canAccessServiceRequestForEstimate(user, serviceRequestId);
  if (!serviceRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const estimates = await db.estimate.findMany({
    where: {
      serviceRequestId,
      ...(user.role === "CUSTOMER" ? { status: { not: "DRAFT" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    estimates: estimates.map(serializeEstimate),
    serviceRequest: {
      id: serviceRequest.id,
      title: serviceRequest.title,
      referenceNumber: serviceRequest.referenceNumber,
      status: serviceRequest.status,
    },
  });
}

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = estimateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid estimate" }, { status: 400 });
  }

  const data = parsed.data;
  const serviceRequest = await db.serviceRequest.findUnique({
    where: { id: data.serviceRequestId },
  });

  if (!serviceRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (["CANCELLED", "ARCHIVED", "CONVERTED_TO_JOB"].includes(serviceRequest.status)) {
    return NextResponse.json({ error: "Cannot create estimates for this request status" }, { status: 400 });
  }

  const totalCost = data.laborCost + data.materialsCost;
  const estimate = await db.estimate.create({
    data: {
      serviceRequestId: data.serviceRequestId,
      title: data.title,
      description: data.description,
      laborCost: data.laborCost,
      materialsCost: data.materialsCost,
      totalCost,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      status: "DRAFT",
    },
  });

  await db.serviceRequest.update({
    where: { id: data.serviceRequestId },
    data: { status: "ESTIMATE_NEEDED" },
  });

  await createAuditLog({
    userId: admin.id,
    serviceRequestId: data.serviceRequestId,
    action: "ESTIMATE_CREATED",
    entityType: "Estimate",
    entityId: estimate.id,
    newValue: { status: "DRAFT", totalCost },
  });

  return NextResponse.json({ estimate: serializeEstimate(estimate) }, { status: 201 });
}
