import { Suspense } from "react";
import LoginPageClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16">Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
