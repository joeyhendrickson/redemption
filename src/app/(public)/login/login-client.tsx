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

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/customer";
  const isEmployeeLogin = redirect === "/admin" || redirect.startsWith("/admin/");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [form, setForm] = useState({
    email: searchParams.get("email") ?? "",
    password: "",
  });

  useEffect(() => {
    if (searchParams.get("registered") === "1" || searchParams.get("verify") === "sent") {
      toast.message("Check your email to verify your account before signing in.");
    }
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified. You can sign in now.");
      setNeedsVerification(false);
    }
    if (searchParams.get("error") === "verification_failed") {
      toast.error("Email verification failed or expired. Request a new link below.");
      setNeedsVerification(true);
    }
    if (searchParams.get("reset") === "success") {
      toast.success("Your password has been updated. Sign in with your new password.");
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setNeedsVerification(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;

      const profileResponse = await fetch("/api/auth/profile");
      let profile: { role?: string; message?: string; error?: string } = {};

      if (profileResponse.ok) {
        profile = await profileResponse.json();
      } else {
        try {
          profile = await profileResponse.json();
        } catch {
          profile = {};
        }
      }

      if (isEmployeeLogin && !profileResponse.ok) {
        await supabase.auth.signOut();
        throw new Error(
          profile.message ??
            "Admin access is not set up yet. The app database still needs its first-time setup in Supabase.",
        );
      }

      const destination =
        profile.role === "ADMIN"
          ? "/admin"
          : profile.role === "CONTRACTOR"
            ? "/contractor"
            : isEmployeeLogin
              ? "/customer"
              : redirect;

      if (isEmployeeLogin && profile.role !== "ADMIN") {
        await supabase.auth.signOut();
        throw new Error("This login is for Redemption Home Services employees with admin access.");
      }

      if (!profileResponse.ok) {
        throw new Error(profile.message ?? "Unable to load your account profile.");
      }

      toast.success("Welcome back.");
      router.push(destination);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      if (/email not confirmed/i.test(message)) {
        setNeedsVerification(true);
        toast.error("Please verify your email before signing in.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!form.email) {
      toast.error("Enter your email address first.");
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to resend verification email.");
      toast.success(result.message ?? "Verification email sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isEmployeeLogin ? "Employee Login" : "Customer Login"}</CardTitle>
          <CardDescription>
            {isEmployeeLogin
              ? "Sign in to the administrator portal."
              : "Access your requests, jobs, messages, and appointments."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.get("verified") === "1" ? (
            <div className="mb-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-muted-foreground">
              Your email is verified. Sign in below to access your customer portal.
            </div>
          ) : null}

          {(searchParams.get("registered") === "1" || searchParams.get("verify") === "sent") && (
            <div className="mb-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-muted-foreground">
              We sent a verification link to your email. Click it to confirm your account, then sign in below.
            </div>
          )}

          {needsVerification ? (
            <div className="mb-4 rounded-lg border px-4 py-3 text-sm">
              <p className="font-medium">Email verification required</p>
              <p className="mt-1 text-muted-foreground">
                Your account is not verified yet. Use the link in your email, or request a new one below.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend verification email
              </Button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href={
                    isEmployeeLogin
                      ? "/forgot-password?redirect=/admin"
                      : `/forgot-password?email=${encodeURIComponent(form.email)}`
                  }
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign In
            </Button>
          </form>
          <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
            {isEmployeeLogin ? (
              <p>
                <Link href="/login" className="text-foreground underline">
                  Customer login
                </Link>
              </p>
            ) : (
              <>
                <p>
                  Need an account?{" "}
                  <Link href="/register" className="text-foreground underline">
                    Register
                  </Link>
                </p>
                <p>
                  <Link href="/#request-service" className="text-foreground underline">
                    Submit a service request
                  </Link>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
