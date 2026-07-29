"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type FileRecord = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: string;
  createdAt: string;
};

export function FileManager({
  serviceRequestId,
  jobId,
  allowReceipts = false,
  title = "Photos & Documents",
}: {
  serviceRequestId?: string;
  jobId?: string;
  allowReceipts?: boolean;
  title?: string;
}) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("PHOTO");

  const query = serviceRequestId
    ? `serviceRequestId=${serviceRequestId}`
    : jobId
      ? `jobId=${jobId}`
      : "";

  const loadFiles = useCallback(async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/files?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load files");
      setFiles(data.files ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load files");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (serviceRequestId) formData.append("serviceRequestId", serviceRequestId);
      if (jobId) formData.append("jobId", jobId);
      if (allowReceipts && selectedCategory === "RECEIPT") {
        formData.append("category", "RECEIPT");
      }

      setProgress(60);
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");

      setProgress(100);
      await loadFiles();
      toast.success("File uploaded.");
      event.target.value = "";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Upload photos, videos, or PDFs up to 10MB each.
        </p>
      </div>

      <div className="rounded-lg border border-dashed p-4">
        {allowReceipts ? (
          <div className="mb-3">
            <Label htmlFor="file-category">Upload type</Label>
            <select
              id="file-category"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="PHOTO">Photo / document</option>
              <option value="RECEIPT">Receipt</option>
            </select>
          </div>
        ) : null}

        <Label htmlFor={`file-upload-${serviceRequestId ?? jobId}`} className="cursor-pointer">
          <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-4 py-3 hover:bg-muted/40">
            <FileUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Choose a file to upload</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP, GIF, MP4, MOV, PDF</p>
            </div>
          </div>
        </Label>
        <Input
          id={`file-upload-${serviceRequestId ?? jobId}`}
          type="file"
          className="sr-only"
          accept="image/*,video/*,application/pdf"
          disabled={uploading}
          onChange={handleUpload}
        />
        {uploading ? (
          <div className="mt-3 space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">Uploading...</p>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border p-3 transition hover:bg-muted/30"
            >
              <p className="font-medium line-clamp-1">{file.fileName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {file.category} · {(file.fileSize / 1024 / 1024).toFixed(2)} MB ·{" "}
                {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
              </p>
              {file.mimeType.startsWith("image/") ? (
                <img
                  src={file.fileUrl}
                  alt={file.fileName}
                  className="mt-3 h-32 w-full rounded-md object-cover"
                />
              ) : null}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
