"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseAuthHashErrors } from "@/components/auth/supabase-auth-hash-handler";

type Step = "request" | "reset" | "recovery-link";

export default function ForgotPasswordPageClient() {
  useSupabaseAuthHashErrors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/customer";
  const initialEmail = searchParams.get("email") ?? "";
  const loginHref = redirect === "/admin" || redirect.startsWith("/admin/") ? "/login?redirect=/admin" : "/login";

  const [step, setStep] = useState<Step>(
    searchParams.get("recovery") === "1" ? "recovery-link" : initialEmail ? "reset" : "request",
  );
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [form, setForm] = useState({
    email: initialEmail,
    code: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (searchParams.get("error") === "recovery_failed") {
      toast.error("Password reset link expired or is invalid. Request a new code.");
      setStep("request");
    }
  }, [searchParams]);

  async function handleRecoveryLinkReset(event: React.FormEvent) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setRecoveryLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: form.password });
      if (error) throw error;

      await supabase.auth.signOut();
      toast.success("Your password has been updated. You can sign in now.");
      const separator = loginHref.includes("?") ? "&" : "?";
      router.push(
        `${loginHref}${separator}email=${encodeURIComponent(form.email || initialEmail)}&reset=success`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function handleRequestCode(event: React.FormEvent) {
    event.preventDefault();
    setRequestLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to send reset code.");

      toast.success(result.message ?? "Password reset instructions sent.");
      if (result.delivery === "link") {
        setStep("request");
        return;
      }

      setStep("reset");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset code.");
    } finally {
      setRequestLoading(false);
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    setResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          code: form.code,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to reset password.");

      toast.success(result.message ?? "Password updated.");
      const separator = loginHref.includes("?") ? "&" : "?";
      router.push(
        `${loginHref}${separator}email=${encodeURIComponent(form.email)}&reset=success`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleResendCode() {
    setRequestLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to send reset code.");
      toast.success(result.message ?? "A new reset code has been sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset code.");
    } finally {
      setRequestLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {step === "request"
              ? "Forgot Password"
              : step === "recovery-link"
                ? "Choose a New Password"
                : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === "request"
              ? "Enter your email and we will send you a reset code."
              : step === "recovery-link"
                ? "Your reset link is verified. Enter a new password below."
                : "Enter the code from your email and choose a new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "recovery-link" ? (
            <form onSubmit={handleRecoveryLinkReset} className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={recoveryLoading}>
                {recoveryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </form>
          ) : step === "request" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={requestLoading}>
                {requestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Reset code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value.trim() })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={requestLoading || !form.email}
              >
                {requestLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send a new code
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("request")}>
                Use a different email
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href={loginHref} className="text-foreground underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
