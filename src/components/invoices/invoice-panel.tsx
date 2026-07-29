"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string | null;
  paidAt: string | null;
};

export function InvoicePanel({
  jobId,
  mode,
}: {
  jobId: string;
  mode: "admin" | "customer";
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [form, setForm] = useState({ subtotal: "", tax: "0", notes: "", dueDate: "" });

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invoices?jobId=${jobId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load invoices");
      setInvoices(data.invoices ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load invoices");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          subtotal: form.subtotal,
          tax: form.tax,
          notes: form.notes || undefined,
          dueDate: form.dueDate || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create invoice");
      setForm({ subtotal: "", tax: "0", notes: "", dueDate: "" });
      await loadInvoices();
      toast.success("Invoice created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create invoice");
    } finally {
      setSaving(false);
    }
  }

  async function handlePay(invoiceId: string) {
    setSaving(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/checkout`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to start checkout");
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start checkout");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mode === "admin" ? (
        <form onSubmit={handleCreate} className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">Create Invoice</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="invoice-subtotal">Subtotal</Label>
              <Input
                id="invoice-subtotal"
                type="number"
                min="0"
                step="0.01"
                className="mt-2"
                value={form.subtotal}
                onChange={(event) => setForm({ ...form, subtotal: event.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="invoice-tax">Tax</Label>
              <Input
                id="invoice-tax"
                type="number"
                min="0"
                step="0.01"
                className="mt-2"
                value={form.tax}
                onChange={(event) => setForm({ ...form, tax: event.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="invoice-due-date">Due date</Label>
            <Input
              id="invoice-due-date"
              type="date"
              className="mt-2"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="invoice-notes">Notes</Label>
            <Textarea
              id="invoice-notes"
              className="mt-2"
              rows={2}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving}>Create Invoice</Button>
        </form>
      ) : null}

      {invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    ${invoice.total.toFixed(2)} · subtotal ${invoice.subtotal.toFixed(2)}
                    {invoice.tax > 0 ? ` · tax $${invoice.tax.toFixed(2)}` : ""}
                  </p>
                </div>
                <Badge variant={invoice.status === "PAID" ? "default" : "secondary"}>
                  {invoice.status}
                </Badge>
              </div>
              {mode === "customer" && invoice.status !== "PAID" ? (
                <Button
                  className="mt-3"
                  onClick={() => handlePay(invoice.id)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  Pay with Stripe
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
