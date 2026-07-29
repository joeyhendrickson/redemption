"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewRecord = {
  id: string;
  overallRating: number | null;
  qualityRating: number | null;
  communicationRating: number | null;
  timelinessRating: number | null;
  cleanlinessRating: number | null;
  privateFeedback: string | null;
  testimonial: string | null;
  unresolvedIssue: boolean;
  issueDescription: string | null;
  createdAt: string;
};

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className="rounded p-1 hover:bg-muted"
            onClick={() => onChange(rating)}
            aria-label={`${label}: ${rating} stars`}
          >
            <Star
              className={`h-5 w-5 ${rating <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PostCompletionReviewPanel({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<ReviewRecord | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [form, setForm] = useState({
    overallRating: 5,
    qualityRating: 5,
    communicationRating: 5,
    timelinessRating: 5,
    cleanlinessRating: 5,
    privateFeedback: "",
    testimonial: "",
    unresolvedIssue: false,
    issueDescription: "",
  });

  const loadReview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?jobId=${jobId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load review");
      setReview(data.review);
      setCanSubmit(Boolean(data.canSubmit));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load review");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          ...form,
          privateFeedback: form.privateFeedback || undefined,
          testimonial: form.testimonial || undefined,
          issueDescription: form.unresolvedIssue ? form.issueDescription : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to submit review");
      setReview(data.review);
      setCanSubmit(false);
      toast.success("Thank you for your feedback.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (review) {
    return (
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Review submitted</h3>
          <p className="text-sm text-muted-foreground">
            Thank you for sharing feedback on this completed job.
          </p>
        </div>
        <p className="text-sm">
          Overall rating: <strong>{review.overallRating}/5</strong>
        </p>
        {review.unresolvedIssue ? (
          <p className="text-sm text-amber-700">
            We received your unresolved issue report and our team will follow up.
          </p>
        ) : null}
      </div>
    );
  }

  if (!canSubmit) {
    return (
      <p className="text-sm text-muted-foreground">
        A review will be available once your job is marked complete.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="font-semibold">How did we do?</h3>
        <p className="text-sm text-muted-foreground">
          Share ratings and optional feedback about your completed job.
        </p>
      </div>

      <StarRating
        label="Overall experience"
        value={form.overallRating}
        onChange={(overallRating) => setForm({ ...form, overallRating })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StarRating
          label="Quality"
          value={form.qualityRating}
          onChange={(qualityRating) => setForm({ ...form, qualityRating })}
        />
        <StarRating
          label="Communication"
          value={form.communicationRating}
          onChange={(communicationRating) => setForm({ ...form, communicationRating })}
        />
        <StarRating
          label="Timeliness"
          value={form.timelinessRating}
          onChange={(timelinessRating) => setForm({ ...form, timelinessRating })}
        />
        <StarRating
          label="Cleanliness"
          value={form.cleanlinessRating}
          onChange={(cleanlinessRating) => setForm({ ...form, cleanlinessRating })}
        />
      </div>

      <div>
        <Label htmlFor="private-feedback">Private feedback (optional)</Label>
        <Textarea
          id="private-feedback"
          className="mt-2"
          rows={3}
          value={form.privateFeedback}
          onChange={(event) => setForm({ ...form, privateFeedback: event.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="testimonial">Public testimonial (optional)</Label>
        <Textarea
          id="testimonial"
          className="mt-2"
          rows={3}
          value={form.testimonial}
          onChange={(event) => setForm({ ...form, testimonial: event.target.value })}
          placeholder="Share a quote we can publish with your permission."
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox
          id="unresolved-issue"
          checked={form.unresolvedIssue}
          onCheckedChange={(checked) =>
            setForm({ ...form, unresolvedIssue: checked === true })
          }
        />
        <div>
          <Label htmlFor="unresolved-issue">Something still needs attention</Label>
          <p className="text-sm text-muted-foreground">
            Check this if part of the work is unresolved and our team should follow up.
          </p>
        </div>
      </div>

      {form.unresolvedIssue ? (
        <div>
          <Label htmlFor="issue-description">Describe the issue</Label>
          <Textarea
            id="issue-description"
            className="mt-2"
            rows={3}
            required
            value={form.issueDescription}
            onChange={(event) => setForm({ ...form, issueDescription: event.target.value })}
          />
        </div>
      ) : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Review
      </Button>
    </form>
  );
}
