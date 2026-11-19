// app.tsx
// Basic example: ONE language (en-US) and NO branches. The whole app is one component (no router):
//   - signed out: the login page
//   - signed in:  AppLayout, and inside it the component for the current page (?page=profiles -> "/profiles")

import {
  ComingSoon,
  isAuthenticatedSignal,
  isDesktopSidebarSignal,
  layoutChoiceSignal,
  PageNotFound,
  RequireAccess,
  SkeletonAuthForm,
  SkeletonPage,
  useCurrentPage,
} from "shared-lib-web";
import { AppLayout, AsideLayout } from "shared-lib-web/layout";
import { useSignals } from "@preact/signals-react/runtime";
import { lazy, Suspense, type ReactElement } from "react";
import { AuthPage } from "./modules/auth/auth.page.tsx";
import { HeaderUser } from "./modules/auth/components/header-user.tsx";
import { DashboardPage } from "./modules/dashboard/dashboard.page.tsx";
import { ProfilePage } from "./modules/profiles/profile.page.tsx";
import { SettingsPage } from "./modules/settings/settings.page.tsx";

const MenuAccessPage = lazy(() =>
  import("./modules/menu/menu-access/menu-access.page.tsx").then((module) => ({
    default: module.MenuAccessPage,
  })),
);
const MenuLinkPage = lazy(() =>
  import("./modules/menu/menu-link/menu-link.page.tsx").then((module) => ({
    default: module.MenuLinkPage,
  })),
);

const headerEnd = (
  <div className="module-button-theme">
    <HeaderUser />
  </div>
);
const sidebarUser = (
  <div className="module-button-theme">
    <HeaderUser isInSidebar />
  </div>
);
const pageFallback = <SkeletonPage />;
const loginFallback = <SkeletonAuthForm />;
const comingSoon = <ComingSoon />;
const notFound = <PageNotFound />;

/** The component for each page value. The keys are the hrefs of the backend menu (util /authorization/<persona>?roles=<roles>). */
const PAGE_ELEMENTS: Record<string, ReactElement> = {
  "/": <DashboardPage />,
  "/dashboard": <DashboardPage />,
  "/products": comingSoon,
  "/stores": comingSoon,
  "/profiles": <ProfilePage />,
  "/store-management": comingSoon,
  "/role-assignor": comingSoon,
  "/menu-management": <MenuLinkPage />,
  "/menu-access": <MenuAccessPage />,
  "/app-settings": <SettingsPage />,
};

/** The component for a page value, or "page not found". */
function readPageElement(page: string): ReactElement {
  return PAGE_ELEMENTS[page] ?? notFound;
}

export function App() {
  useSignals();
  const page = useCurrentPage();
  if (!isAuthenticatedSignal.value) {
    return (
      <div className="module-button-theme">
        <Suspense fallback={loginFallback}>
          <AuthPage />
        </Suspense>
      </div>
    );
  }
  const pageElement = readPageElement(page);
  // On desktop in "sidebar" mode the user sits at the bottom of the side menu, so the header copy is hidden there.
  const headerUserClassName = isDesktopSidebarSignal.value
    ? "lg:hidden"
    : undefined;
  const appHeaderEnd = <div className={headerUserClassName}>{headerEnd}</div>;
  const pageContent = (
    <div className="module-button-theme">
      <Suspense fallback={pageFallback}>
        <RequireAccess key={page}>{pageElement}</RequireAccess>
      </Suspense>
    </div>
  );
  if (layoutChoiceSignal.value === "aside") {
    return <AsideLayout sidebarUser={sidebarUser}>{pageContent}</AsideLayout>;
  }
  return (
    <AppLayout headerEnd={appHeaderEnd} sidebarUser={sidebarUser}>
      {pageContent}
    </AppLayout>
  );
}
