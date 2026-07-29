"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function EstimateApprovalPanel({ serviceRequestId }: { serviceRequestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<EstimateRecord[]>([]);

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

  async function handleApprove(estimateId: string) {
    setActingOn(estimateId);
    try {
      const response = await fetch(`/api/estimates/${estimateId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to approve estimate");

      toast.success(`Estimate approved. Job ${data.job.referenceNumber} created.`);
      router.push("/customer/jobs");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to approve estimate");
    } finally {
      setActingOn(null);
    }
  }

  async function handleDecline(estimateId: string) {
    setActingOn(estimateId);
    try {
      const response = await fetch(`/api/estimates/${estimateId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: declineNote || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to decline estimate");

      setDecliningId(null);
      setDeclineNote("");
      await loadEstimates();
      toast.success("Estimate declined.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to decline estimate");
    } finally {
      setActingOn(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No estimates have been sent for this request yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {estimates.map((estimate) => {
        const awaitingApproval = estimate.status === "SENT";
        return (
          <div key={estimate.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{estimate.title}</p>
                {estimate.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{estimate.description}</p>
                ) : null}
              </div>
              <Badge variant={awaitingApproval ? "default" : "secondary"}>
                {ESTIMATE_STATUS_LABELS[estimate.status] ?? estimate.status}
              </Badge>
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <p>Labor: {formatCurrency(estimate.laborCost)}</p>
              <p>Materials: {formatCurrency(estimate.materialsCost)}</p>
              <p className="font-semibold">Total: {formatCurrency(estimate.totalCost)}</p>
            </div>

            {estimate.validUntil ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Valid until {format(new Date(estimate.validUntil), "MMM d, yyyy")}
              </p>
            ) : null}

            {awaitingApproval ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Review the estimate below. Approving will create your job and move scheduling forward.
                </p>
                {decliningId === estimate.id ? (
                  <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                    <Textarea
                      rows={3}
                      placeholder="Optional reason for declining..."
                      value={declineNote}
                      onChange={(event) => setDeclineNote(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleDecline(estimate.id)}
                        disabled={actingOn === estimate.id}
                      >
                        {actingOn === estimate.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Confirm Decline
                      </Button>
                      <Button variant="outline" onClick={() => setDecliningId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleApprove(estimate.id)} disabled={actingOn === estimate.id}>
                      {actingOn === estimate.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Approve Estimate
                    </Button>
                    <Button variant="outline" onClick={() => setDecliningId(estimate.id)}>
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
