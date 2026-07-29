"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquarePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MESSAGE_VISIBILITY_LABELS } from "@/lib/constants";
import type { SerializedMessage } from "@/lib/messages";
import type { UserRole } from "@/generated/prisma/client";

type MessageContext = {
  requests: Array<{ id: string; label: string; referenceNumber: string }>;
  jobs: Array<{ id: string; label: string; referenceNumber: string; serviceRequestId: string }>;
};

const ADMIN_VISIBILITY_OPTIONS = ["CUSTOMER", "ADMIN_CONTRACTOR", "INTERNAL"] as const;

export function MessagingInbox({ role, userId }: { role: UserRole; userId: string }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [threads, setThreads] = useState<SerializedMessage[]>([]);
  const [contexts, setContexts] = useState<MessageContext>({ requests: [], jobs: [] });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<SerializedMessage | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({
    contextType: "request",
    contextId: "",
    subject: "",
    body: "",
    visibility: "CUSTOMER",
  });

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load messages");
      setThreads(data.threads ?? []);
      setContexts(data.contexts ?? { requests: [], jobs: [] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages?threadId=${threadId}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load thread");
      setActiveThread(data.thread);
      setSelectedThreadId(threadId);
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? { ...thread, isRead: true, replies: data.thread.replies }
            : thread,
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load thread");
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const contextOptions = useMemo(() => {
    if (role === "CONTRACTOR") {
      return contexts.jobs.map((job) => ({
        value: `job:${job.id}`,
        label: `${job.referenceNumber} — ${job.label}`,
      }));
    }

    return [
      ...contexts.requests.map((request) => ({
        value: `request:${request.id}`,
        label: `${request.referenceNumber} — ${request.label}`,
      })),
      ...contexts.jobs.map((job) => ({
        value: `job:${job.id}`,
        label: `${job.referenceNumber} — ${job.label}`,
      })),
    ];
  }, [contexts, role]);

  async function handleReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedThreadId || !replyBody.trim()) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentMessageId: selectedThreadId,
          body: replyBody.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send reply");

      setReplyBody("");
      await loadThread(selectedThreadId);
      await loadInbox();
      toast.success("Reply sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reply");
    } finally {
      setSending(false);
    }
  }

  async function handleNewThread(event: React.FormEvent) {
    event.preventDefault();
    if (!newThread.contextId || !newThread.body.trim()) return;

    const [contextType, contextId] = newThread.contextId.split(":");
    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceRequestId: contextType === "request" ? contextId : undefined,
          jobId: contextType === "job" ? contextId : undefined,
          subject: newThread.subject || undefined,
          body: newThread.body.trim(),
          visibility: role === "ADMIN" ? newThread.visibility : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to create thread");

      setShowNewThread(false);
      setNewThread({ contextType: "request", contextId: "", subject: "", body: "", visibility: "CUSTOMER" });
      await loadInbox();
      await loadThread(data.message.id);
      toast.success("Message sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create thread");
    } finally {
      setSending(false);
    }
  }

  function unreadCount(thread: SerializedMessage) {
    const unreadRoot = thread.sender.id !== userId && !thread.isRead ? 1 : 0;
    const unreadReplies = thread.replies.filter((reply) => reply.sender.id !== userId && !reply.isRead).length;
    return unreadRoot + unreadReplies;
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="h-[640px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Conversations</CardTitle>
          {contextOptions.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setShowNewThread(true)}>
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[560px]">
            {threads.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No conversations yet. Start a new message when you have an active request or job.
              </p>
            ) : (
              <div className="divide-y">
                {threads.map((thread) => {
                  const unread = unreadCount(thread);
                  const preview = thread.replies.at(-1)?.body ?? thread.body;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => loadThread(thread.id)}
                      className={`w-full px-4 py-3 text-left transition hover:bg-muted/50 ${
                        selectedThreadId === thread.id ? "bg-muted/60" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium line-clamp-1">
                            {thread.subject || thread.contextLabel || "Conversation"}
                          </p>
                          <p className="text-xs text-muted-foreground">{thread.contextReference}</p>
                        </div>
                        {unread > 0 ? <Badge>{unread}</Badge> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{preview}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="h-[640px]">
        {!activeThread ? (
          <CardContent className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a conversation to view the thread.
          </CardContent>
        ) : (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                {activeThread.subject || activeThread.contextLabel || "Conversation"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {activeThread.contextReference}
                {role === "ADMIN" ? ` · ${MESSAGE_VISIBILITY_LABELS[activeThread.visibility]}` : ""}
              </p>
            </CardHeader>
            <CardContent className="flex h-[520px] flex-col p-0">
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {[activeThread, ...activeThread.replies].map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg border p-3 ${
                        message.sender.id === userId ? "ml-8 bg-primary/5" : "mr-8 bg-muted/30"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {message.sender.firstName} {message.sender.lastName}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {message.sender.role.toLowerCase()}
                          </span>
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {role === "ADMIN" ? (
                        <Badge variant="outline" className="mb-2">
                          {MESSAGE_VISIBILITY_LABELS[message.visibility]}
                        </Badge>
                      ) : null}
                      <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <form onSubmit={handleReply} className="border-t p-4">
                <Label htmlFor="reply" className="sr-only">
                  Reply
                </Label>
                <Textarea
                  id="reply"
                  rows={3}
                  placeholder="Write a reply..."
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <Button type="submit" disabled={sending || !replyBody.trim()}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send Reply
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      {showNewThread ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewThread} className="space-y-4">
                <div>
                  <Label>Related request or job</Label>
                  <Select
                    value={newThread.contextId}
                    onValueChange={(value) => value && setNewThread({ ...newThread, contextId: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent>
                      {contextOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject (optional)</Label>
                  <Input
                    id="subject"
                    className="mt-2"
                    value={newThread.subject}
                    onChange={(event) => setNewThread({ ...newThread, subject: event.target.value })}
                  />
                </div>
                {role === "ADMIN" ? (
                  <div>
                    <Label>Visibility</Label>
                    <Select
                      value={newThread.visibility}
                      onValueChange={(value) => value && setNewThread({ ...newThread, visibility: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADMIN_VISIBILITY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {MESSAGE_VISIBILITY_LABELS[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                <div>
                  <Label htmlFor="new-body">Message</Label>
                  <Textarea
                    id="new-body"
                    rows={5}
                    className="mt-2"
                    value={newThread.body}
                    onChange={(event) => setNewThread({ ...newThread, body: event.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewThread(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending || !newThread.contextId || !newThread.body.trim()}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
