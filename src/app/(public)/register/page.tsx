import { Suspense } from "react";
import RegisterPageClient from "./register-client";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16">Loading...</div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
