"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { JOB_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";

type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progressPercentage: number;
  blockerReason: string | null;
  materialsRequired: string | null;
  actualHours: number | null;
};

type JobRecord = {
  id: string;
  title: string;
  status: string;
  completionPercentage: number;
  serviceAddress: string;
  accessInstructions: string | null;
  safetyNotes: string | null;
  tasks: TaskRecord[];
};

export function ContractorTaskPanel({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [drafts, setDrafts] = useState<Record<string, {
    progressPercentage: number;
    status: string;
    blockerReason: string;
    actualHours: string;
    materialsRequired: string;
  }>>({});

  const loadJob = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load job");

      setJob(data.job);
      setDrafts(
        Object.fromEntries(
          (data.job.tasks as TaskRecord[]).map((task) => [
            task.id,
            {
              progressPercentage: task.progressPercentage,
              status: task.status,
              blockerReason: task.blockerReason ?? "",
              actualHours: task.actualHours?.toString() ?? "",
              materialsRequired: task.materialsRequired ?? "",
            },
          ]),
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  async function saveTask(taskId: string) {
    const draft = drafts[taskId];
    if (!draft) return;

    setSavingTaskId(taskId);
    try {
      const response = await fetch(`/api/jobs/${jobId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          progressPercentage: draft.progressPercentage,
          blockerReason: draft.blockerReason || undefined,
          actualHours: draft.actualHours || undefined,
          materialsRequired: draft.materialsRequired || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update task");
      setJob(data.job);
      toast.success("Task updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update task");
    } finally {
      setSavingTaskId(null);
    }
  }

  async function addTask(event: React.FormEvent) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;

    setSavingTaskId("new");
    try {
      const response = await fetch(`/api/jobs/${jobId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to add task");
      setNewTaskTitle("");
      setJob(data.job);
      await loadJob();
      toast.success("Task added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add task");
    } finally {
      setSavingTaskId(null);
    }
  }

  if (loading || !job) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-muted-foreground">{job.serviceAddress}</p>
          </div>
          <Badge>{JOB_STATUS_LABELS[job.status] ?? job.status}</Badge>
        </div>
        <Progress className="mt-4" value={job.completionPercentage} />
        <p className="mt-2 text-sm text-muted-foreground">{job.completionPercentage}% complete</p>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
        />
        <Button type="submit" disabled={savingTaskId === "new"}>
          {savingTaskId === "new" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </form>

      <div className="space-y-4">
        {job.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
        ) : (
          job.tasks.map((task) => {
            const draft = drafts[task.id];
            if (!draft) return null;

            return (
              <div key={task.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                    ) : null}
                  </div>
                  <Badge variant="outline">{TASK_STATUS_LABELS[task.status] ?? task.status}</Badge>
                </div>

                <div>
                  <Label>Progress: {draft.progressPercentage}%</Label>
                  <Slider
                    className="mt-3"
                    value={[draft.progressPercentage]}
                    max={100}
                    step={5}
                    onValueChange={(value) => {
                      const next = Array.isArray(value) ? value[0] ?? 0 : value;
                      setDrafts({
                        ...drafts,
                        [task.id]: {
                          ...draft,
                          progressPercentage: next,
                          status: next === 100 ? "COMPLETED" : next > 0 ? "IN_PROGRESS" : draft.status,
                        },
                      });
                    }}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={draft.status}
                      onValueChange={(value) =>
                        value &&
                        setDrafts({
                          ...drafts,
                          [task.id]: {
                            ...draft,
                            status: value,
                            progressPercentage: value === "COMPLETED" ? 100 : draft.progressPercentage,
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["PENDING", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map((status) => (
                          <SelectItem key={status} value={status}>
                            {TASK_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`hours-${task.id}`}>Hours worked</Label>
                    <Input
                      id={`hours-${task.id}`}
                      type="number"
                      min="0"
                      step="0.25"
                      className="mt-2"
                      value={draft.actualHours}
                      onChange={(event) =>
                        setDrafts({ ...drafts, [task.id]: { ...draft, actualHours: event.target.value } })
                      }
                    />
                  </div>
                </div>

                {draft.status === "BLOCKED" ? (
                  <div>
                    <Label htmlFor={`blocker-${task.id}`}>Blocker reason</Label>
                    <Textarea
                      id={`blocker-${task.id}`}
                      className="mt-2"
                      rows={2}
                      value={draft.blockerReason}
                      onChange={(event) =>
                        setDrafts({ ...drafts, [task.id]: { ...draft, blockerReason: event.target.value } })
                      }
                    />
                  </div>
                ) : null}

                <div>
                  <Label htmlFor={`materials-${task.id}`}>Materials / notes</Label>
                  <Textarea
                    id={`materials-${task.id}`}
                    className="mt-2"
                    rows={2}
                    value={draft.materialsRequired}
                    onChange={(event) =>
                      setDrafts({ ...drafts, [task.id]: { ...draft, materialsRequired: event.target.value } })
                    }
                  />
                </div>

                <Button onClick={() => saveTask(task.id)} disabled={savingTaskId === task.id}>
                  {savingTaskId === task.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Task
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
