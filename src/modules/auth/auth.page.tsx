"use client";

import { AuthForm } from "./components/auth.form.tsx";

// HTML only — the auth screen (sign-in | forgotpassword | resetpassword) is driven
// by /auth?pathname=...; the URL → view sync lives in ./auth.form.ts (useAuthForm).
export function AuthPage() {
  return <AuthForm />;
}
