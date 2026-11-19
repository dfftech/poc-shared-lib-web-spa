import { useSignals } from "@preact/signals-react/runtime";
import { useCurrentPage, useQueryParam } from "shared-lib-web";
import { useMemo } from "react";
import { authViewToPathname, pathnameToAuthView } from "./auth.form.ts";

// TypeScript only - exposes the canonical /auth?pathname=... URL for the current screen.
export function useAuthView() {
  useSignals();
  const page = useCurrentPage();
  const authPathname = useQueryParam("pathname");
  const canonicalUrl = useMemo(
    () => `${page}?pathname=${authViewToPathname(pathnameToAuthView(authPathname))}`,
    [page, authPathname],
  );
  return { canonicalUrl };
}
