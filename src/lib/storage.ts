import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export function getStorageBucket() {
  return (
    process.env.SUPABASE_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ??
    "uploads"
  );
}

export function isStorageConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      getStorageBucket(),
  );
}

function getStorageAdminClient() {
  if (!isStorageConfigured()) {
    throw new Error("Supabase Storage is not configured");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export function validateUploadFile(file: File) {
  if (!file.size) {
    return { ok: false as const, error: "Empty file" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false as const, error: `${file.name} exceeds the 10MB limit` };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { ok: false as const, error: `${file.name} has an unsupported file type` };
  }

  return { ok: true as const };
}

export function inferFileCategory(mimeType: string) {
  if (mimeType.startsWith("video/")) return "VIDEO" as const;
  if (mimeType === "application/pdf") return "PDF" as const;
  return "PHOTO" as const;
}

export async function uploadToStorage({
  folder,
  fileName,
  mimeType,
  buffer,
}: {
  folder: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const bucket = getStorageBucket();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${randomUUID()}-${sanitized}`;
  const supabase = getStorageAdminClient();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function resolveStorageUrl(storedPath: string) {
  if (storedPath.startsWith("data:") || storedPath.startsWith("http")) {
    return storedPath;
  }

  const bucket = getStorageBucket();
  const supabase = getStorageAdminClient();

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storedPath, 60 * 60);
  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storedPath);
  return publicData.publicUrl;
}

export async function uploadFileRecord({
  folder,
  file,
  buffer,
}: {
  folder: string;
  file: File;
  buffer: Buffer;
}) {
  if (isStorageConfigured()) {
    const path = await uploadToStorage({
      folder,
      fileName: file.name,
      mimeType: file.type,
      buffer,
    });
    return path;
  }

  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function serializeFileRecord(file: {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: string;
  caption: string | null;
  createdAt: Date;
}) {
  return {
    id: file.id,
    fileName: file.fileName,
    fileUrl: await resolveStorageUrl(file.fileUrl),
    fileSize: file.fileSize,
    mimeType: file.mimeType,
    category: file.category,
    caption: file.caption,
    createdAt: file.createdAt.toISOString(),
  };
}
