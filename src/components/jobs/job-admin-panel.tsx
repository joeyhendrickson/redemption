"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { JOB_STATUS_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";

type ContractorOption = { id: string; firstName: string; lastName: string; email: string };

type JobRecord = {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
  completionPercentage: number;
  contractorId: string | null;
  contractor: ContractorOption | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    progressPercentage: number;
    weight: number;
  }>;
};

export function JobAdminPanel({
  jobId,
  contractors,
}: {
  jobId: string;
  contractors: ContractorOption[];
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [selectedContractor, setSelectedContractor] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", weight: "1" });
  const [scheduleForm, setScheduleForm] = useState({ scheduledStart: "", scheduledEnd: "" });
  const [statusForm, setStatusForm] = useState("");

  const loadJob = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load job");
      setJob(data.job);
      setSelectedContractor(data.job.contractorId ?? "");
      setScheduleForm({
        scheduledStart: data.job.scheduledStart ? data.job.scheduledStart.slice(0, 16) : "",
        scheduledEnd: data.job.scheduledEnd ? data.job.scheduledEnd.slice(0, 16) : "",
      });
      setStatusForm(data.job.status);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  async function handleAssign() {
    if (!selectedContractor) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractorId: selectedContractor }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to assign contractor");
      setJob(data.job);
      toast.success("Contractor assigned.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to assign contractor");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTask(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description || undefined,
          weight: taskForm.weight,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to add task");
      setTaskForm({ title: "", description: "", weight: "1" });
      setJob(data.job);
      toast.success("Task added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add task");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusSave() {
    if (!statusForm) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusForm }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update status");
      setJob(data.job);
      toast.success("Job status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update status");
    } finally {
      setSaving(false);
    }
  }

  async function handleScheduleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledStart: scheduleForm.scheduledStart || undefined,
          scheduledEnd: scheduleForm.scheduledEnd || undefined,
          status: scheduleForm.scheduledStart ? "SCHEDULED" : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update schedule");
      setJob(data.job);
      toast.success("Schedule updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update schedule");
    } finally {
      setSaving(false);
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-muted-foreground">{job.referenceNumber}</p>
          </div>
          <Badge>{JOB_STATUS_LABELS[job.status] ?? job.status}</Badge>
        </div>
        <Progress className="mt-4" value={job.completionPercentage} />
        <p className="mt-2 text-sm text-muted-foreground">{job.completionPercentage}% complete</p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div>
          <h3 className="font-semibold">Assign Contractor</h3>
          <p className="text-sm text-muted-foreground">
            Current: {job.contractor ? `${job.contractor.firstName} ${job.contractor.lastName}` : "Unassigned"}
          </p>
        </div>
        <Select value={selectedContractor} onValueChange={(value) => value && setSelectedContractor(value)}>
          <SelectTrigger><SelectValue placeholder="Select contractor" /></SelectTrigger>
          <SelectContent>
            {contractors.map((contractor) => (
              <SelectItem key={contractor.id} value={contractor.id}>
                {contractor.firstName} {contractor.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAssign} disabled={saving || !selectedContractor}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Assign Contractor
        </Button>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold">Job Status</h3>
        <Select value={statusForm} onValueChange={(value) => value && setStatusForm(value)}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            {[
              "QUALITY_REVIEW",
              "COMPLETED",
              "CLOSED",
              "WAITING_ON_CUSTOMER",
              "IN_PROGRESS",
              "PAUSED",
              "CANCELLED",
            ].map((status) => (
              <SelectItem key={status} value={status}>
                {JOB_STATUS_LABELS[status] ?? status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleStatusSave} disabled={saving}>
          Update Status
        </Button>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold">Schedule</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="scheduled-start">Start</Label>
            <Input
              id="scheduled-start"
              type="datetime-local"
              className="mt-2"
              value={scheduleForm.scheduledStart}
              onChange={(event) => setScheduleForm({ ...scheduleForm, scheduledStart: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="scheduled-end">End</Label>
            <Input
              id="scheduled-end"
              type="datetime-local"
              className="mt-2"
              value={scheduleForm.scheduledEnd}
              onChange={(event) => setScheduleForm({ ...scheduleForm, scheduledEnd: event.target.value })}
            />
          </div>
        </div>
        <Button variant="outline" onClick={handleScheduleSave} disabled={saving}>
          Save Schedule
        </Button>
      </div>

      <form onSubmit={handleAddTask} className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold">Add Task</h3>
        <div>
          <Label htmlFor="task-title">Task title</Label>
          <Input
            id="task-title"
            className="mt-2"
            value={taskForm.title}
            onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            className="mt-2"
            rows={2}
            value={taskForm.description}
            onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="task-weight">Weight</Label>
          <Input
            id="task-weight"
            type="number"
            min="1"
            className="mt-2"
            value={taskForm.weight}
            onChange={(event) => setTaskForm({ ...taskForm, weight: event.target.value })}
          />
        </div>
        <Button type="submit" disabled={saving}>Add Task</Button>
      </form>

      <div className="space-y-3">
        <h3 className="font-semibold">Tasks</h3>
        {job.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          job.tasks.map((task) => (
            <div key={task.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{task.title}</p>
                <Badge variant="outline">{TASK_STATUS_LABELS[task.status] ?? task.status}</Badge>
              </div>
              <Progress className="mt-2" value={task.progressPercentage} />
              <p className="mt-1 text-xs text-muted-foreground">
                {task.progressPercentage}% · weight {task.weight}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
