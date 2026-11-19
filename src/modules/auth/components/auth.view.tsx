"use client";

import { useAuthView } from "./auth.view.ts";

// HTML only — auth has no separate read-only view; kept for skill parity.
export function AuthView() {
  useAuthView();
  return null;
}
