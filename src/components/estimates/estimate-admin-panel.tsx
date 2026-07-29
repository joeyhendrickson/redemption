"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ESTIMATE_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils/helpers";

type EstimateRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  laborCost: number;
  materialsCost: number;
  totalCost: number;
  validUntil: string | null;
  sentAt: string | null;
};

export function EstimateAdminPanel({ serviceRequestId }: { serviceRequestId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<EstimateRecord[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    laborCost: "",
    materialsCost: "",
    validUntil: "",
  });

  const loadEstimates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/estimates?serviceRequestId=${serviceRequestId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load estimates");
      setEstimates(data.estimates ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load estimates");
    } finally {
      setLoading(false);
    }
  }, [serviceRequestId]);

  useEffect(() => {
    loadEstimates();
  }, [loadEstimates]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceRequestId,
          title: form.title,
          description: form.description || undefined,
          laborCost: form.laborCost,
          materialsCost: form.materialsCost,
          validUntil: form.validUntil || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create estimate");

      setForm({ title: "", description: "", laborCost: "", materialsCost: "", validUntil: "" });
      await loadEstimates();
      toast.success("Draft estimate created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create estimate");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend(estimateId: string) {
    setSendingId(estimateId);
    try {
      const response = await fetch(`/api/estimates/${estimateId}/send`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send estimate");
      await loadEstimates();
      toast.success("Estimate sent to customer.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send estimate");
    } finally {
      setSendingId(null);
    }
  }

  const labor = Number(form.laborCost || 0);
  const materials = Number(form.materialsCost || 0);

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-lg border bg-card p-4 space-y-4">
        <div>
          <h3 className="font-semibold">Create Estimate</h3>
          <p className="text-sm text-muted-foreground">Draft an estimate, then send it to the customer for approval.</p>
        </div>
        <div>
          <Label htmlFor="estimate-title">Title</Label>
          <Input
            id="estimate-title"
            className="mt-2"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimate-description">Description</Label>
          <Textarea
            id="estimate-description"
            className="mt-2"
            rows={3}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="labor-cost">Labor</Label>
            <Input
              id="labor-cost"
              type="number"
              min="0"
              step="0.01"
              className="mt-2"
              value={form.laborCost}
              onChange={(event) => setForm({ ...form, laborCost: event.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="materials-cost">Materials</Label>
            <Input
              id="materials-cost"
              type="number"
              min="0"
              step="0.01"
              className="mt-2"
              value={form.materialsCost}
              onChange={(event) => setForm({ ...form, materialsCost: event.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="valid-until">Valid until</Label>
            <Input
              id="valid-until"
              type="date"
              className="mt-2"
              value={form.validUntil}
              onChange={(event) => setForm({ ...form, validUntil: event.target.value })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Estimated total: {formatCurrency(labor + materials)}</p>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold">Estimate History</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : estimates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No estimates yet.</p>
        ) : (
          estimates.map((estimate) => (
            <div key={estimate.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{estimate.title}</p>
                  {estimate.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{estimate.description}</p>
                  ) : null}
                  <p className="mt-2 text-sm">
                    Labor {formatCurrency(estimate.laborCost)} · Materials {formatCurrency(estimate.materialsCost)}
                  </p>
                  <p className="text-sm font-semibold">Total {formatCurrency(estimate.totalCost)}</p>
                  {estimate.validUntil ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Valid until {format(new Date(estimate.validUntil), "MMM d, yyyy")}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge>{ESTIMATE_STATUS_LABELS[estimate.status] ?? estimate.status}</Badge>
                  {estimate.status === "DRAFT" ? (
                    <Button
                      size="sm"
                      onClick={() => handleSend(estimate.id)}
                      disabled={sendingId === estimate.id}
                    >
                      {sendingId === estimate.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send to Customer
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
