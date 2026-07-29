"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ReviewRecord = {
  id: string;
  overallRating: number | null;
  privateFeedback: string | null;
  testimonial: string | null;
  isPublished: boolean;
  unresolvedIssue: boolean;
  issueDescription: string | null;
  createdAt: string;
  customer: { firstName: string; lastName: string } | null;
};

export function ReviewAdminPanel({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<ReviewRecord | null>(null);

  const loadReview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?jobId=${jobId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load review");
      setReview(data.review);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load review");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  async function togglePublished() {
    if (!review) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !review.isPublished }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update review");
      setReview(data.review);
      toast.success(data.review.isPublished ? "Testimonial published." : "Testimonial unpublished.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update review");
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

  if (!review) {
    return <p className="text-sm text-muted-foreground">No customer review yet.</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {review.customer
              ? `${review.customer.firstName} ${review.customer.lastName}`
              : "Customer review"}
          </p>
          <p className="text-muted-foreground">Overall: {review.overallRating}/5</p>
        </div>
        <div className="flex gap-2">
          {review.unresolvedIssue ? <Badge variant="destructive">Issue reported</Badge> : null}
          {review.isPublished ? <Badge>Published</Badge> : null}
        </div>
      </div>

      {review.privateFeedback ? (
        <div>
          <p className="font-medium">Private feedback</p>
          <p className="mt-1 text-muted-foreground">{review.privateFeedback}</p>
        </div>
      ) : null}

      {review.testimonial ? (
        <div>
          <p className="font-medium">Testimonial</p>
          <p className="mt-1 text-muted-foreground">{review.testimonial}</p>
        </div>
      ) : null}

      {review.unresolvedIssue && review.issueDescription ? (
        <div>
          <p className="font-medium">Unresolved issue</p>
          <p className="mt-1 text-muted-foreground">{review.issueDescription}</p>
        </div>
      ) : null}

      {review.testimonial ? (
        <Button variant="outline" onClick={togglePublished} disabled={saving}>
          {review.isPublished ? "Unpublish testimonial" : "Publish testimonial"}
        </Button>
      ) : null}
    </div>
  );
}
