"use client";

import { useEffect } from "react";
import { toast } from "sonner";

function readAuthHashErrors() {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const error = params.get("error");
  if (!error) return null;

  return {
    error,
    description: params.get("error_description") ?? error,
  };
}

export function useSupabaseAuthHashErrors() {
  useEffect(() => {
    const authError = readAuthHashErrors();
    if (!authError) return;

    const description = authError.description.replace(/\+/g, " ");
    if (/otp_expired|invalid/i.test(authError.error + description)) {
      toast.error("That reset link expired or was already used. Request a new one below.");
    } else {
      toast.error(description);
    }

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);
}
