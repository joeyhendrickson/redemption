import { Suspense } from "react";
import ForgotPasswordPageClient from "./forgot-password-client";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16">Loading...</div>}>
      <ForgotPasswordPageClient />
    </Suspense>
  );
}
