import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import {
  canUploadToJob,
  canUploadToServiceRequest,
  listAccessibleFiles,
} from "@/lib/files";
import {
  inferFileCategory,
  serializeFileRecord,
  uploadFileRecord,
  validateUploadFile,
} from "@/lib/storage";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const serviceRequestId = searchParams.get("serviceRequestId");
  const jobId = searchParams.get("jobId");

  const files = await listAccessibleFiles({
    user,
    serviceRequestId,
    jobId,
  });

  if (!files) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    files: await Promise.all(files.map(serializeFileRecord)),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const serviceRequestId = formData.get("serviceRequestId")?.toString() ?? null;
  const jobId = formData.get("jobId")?.toString() ?? null;
  const caption = formData.get("caption")?.toString() ?? null;
  const categoryInput = formData.get("category")?.toString() ?? null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!serviceRequestId && !jobId) {
    return NextResponse.json({ error: "serviceRequestId or jobId is required" }, { status: 400 });
  }

  const validation = validateUploadFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (serviceRequestId) {
    const requestRecord = await canUploadToServiceRequest(user, serviceRequestId);
    if (!requestRecord) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
  }

  if (jobId) {
    const job = await canUploadToJob(user, jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = serviceRequestId
    ? `service-requests/${serviceRequestId}`
    : `jobs/${jobId}`;

  const storedPath = await uploadFileRecord({ folder, file, buffer });
  const category =
    categoryInput === "RECEIPT"
      ? "RECEIPT"
      : inferFileCategory(file.type);

  const record = await db.file.create({
    data: {
      serviceRequestId,
      jobId,
      uploadedById: user.id,
      fileName: file.name,
      fileUrl: storedPath,
      fileSize: file.size,
      mimeType: file.type,
      category,
      caption,
      isCustomerVisible: user.role !== "CONTRACTOR" || category !== "RECEIPT",
    },
  });

  await createAuditLog({
    userId: user.id,
    serviceRequestId: serviceRequestId ?? undefined,
    jobId: jobId ?? undefined,
    action: "FILE_UPLOADED",
    entityType: "File",
    entityId: record.id,
    newValue: { fileName: record.fileName, category: record.category },
  });

  return NextResponse.json(
    { file: await serializeFileRecord(record) },
    { status: 201 },
  );
}
