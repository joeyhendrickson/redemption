"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function readAuthHashParams() {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  return new URLSearchParams(hash);
}

function clearAuthHash() {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

export function SupabaseAuthRedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    const params = readAuthHashParams();
    if (!params) return;

    const error = params.get("error");
    if (error) {
      const description = (params.get("error_description") ?? error).replace(/\+/g, " ");
      if (/otp_expired|invalid/i.test(error + description)) {
        toast.error("That reset link expired or was already used. Request a new one below.");
      } else {
        toast.error(description);
      }
      clearAuthHash();
      return;
    }

    const type = params.get("type");
    const accessToken = params.get("access_token");

    if (accessToken && type === "recovery") {
      clearAuthHash();
      router.replace("/forgot-password?recovery=1");
      return;
    }

    if (accessToken && type === "signup") {
      clearAuthHash();
      router.replace("/login?verified=1");
    }
  }, [router]);

  return null;
}

export function useSupabaseAuthHashErrors() {
  useEffect(() => {
    const params = readAuthHashParams();
    if (!params?.get("error")) return;

    const error = params.get("error")!;
    const description = (params.get("error_description") ?? error).replace(/\+/g, " ");
    if (/otp_expired|invalid/i.test(error + description)) {
      toast.error("That reset link expired or was already used. Request a new one below.");
    } else {
      toast.error(description);
    }
    clearAuthHash();
  }, []);
}
