"use client";

import { useSignals } from "@preact/signals-react/runtime";
import {
  ContentLayout,
  HeadLayout,
  TypeButton,
  useCurrentPage,
} from "shared-lib-web";
import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo } from "react";
import { RoleAssignorAddModal } from "./components/role-assignor-add-modal.tsx";
import { RoleAssignorDetails } from "./components/role-assignor.details.tsx";
import { RoleAssignorSidebar } from "./components/role-assignor.sidebar.tsx";
import { checkMenuPermission } from "../menu/menu-access/hooks/service.ts";
import {
  setScreenRoute,
  useScreenRouteSearchParams,
} from "../menu/hooks/screen-route.ts";
import {
  isAddProfileModalOpen,
  reloadRolesList,
  rolesList,
  rolesListLoading,
  selectedRole,
} from "./hooks/service";
import { useRoleAssignorTranslation } from "./hooks/use-role-assignor-translation.ts";

export function RoleAssignorPage() {
  useSignals();
  const { label } = useRoleAssignorTranslation();
  const pathname = useCurrentPage();
  const routeParams = useScreenRouteSearchParams();
  const routeAction = routeParams.get("pathname");
  const routeRoleId = routeParams.get("id") || "";
  const routeMode = routeParams.get("mode");
  const roles = rolesList.value;
  const loading = rolesListLoading.value;
  const refreshButtonProps = useMemo(
    () => ({
      type: "button" as const,
      onPress: () => void reloadRolesList(),
      disabled: loading,
      isLoading: loading,
      icon: "RotateCw" as const,
      label: label("user.reload", "Refresh"),
      size: "sm" as const,
      className: "gap-1.5 text-xs font-semibold shadow-2xs",
    }),
    [label, loading],
  );

  useEffect(() => {
    void reloadRolesList(routeRoleId || undefined).then(() => {
      if (
        routeAction === "create" &&
        routeMode === "assign-profile" &&
        selectedRole.value?.id === routeRoleId &&
        checkMenuPermission(pathname, "create")
      ) {
        isAddProfileModalOpen.value = true;
        setScreenRoute("create", routeRoleId, { mode: "assign-profile" });
      } else if (selectedRole.value?.id) {
        setScreenRoute("view", selectedRole.value.id);
      }
    });
  }, []);

  return (
    <>
      <div className="w-full space-y-4">
        <HeadLayout
          title={
            <span className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={22} />
              </span>
              {label("role_assignor", "Role Assignor")}
            </span>
          }
          actions={
            <>
              <span className="text-sm text-base-content/60">
                {roles.length}{" "}
                {roles.length === 1
                  ? label("nav.roles", "role")
                  : label("nav.roles", "roles")}
              </span>
              <TypeButton {...refreshButtonProps} />
            </>
          }
          className="mb-4"
        />

        <ContentLayout className="flex flex-col items-start gap-5 lg:flex-row">
            <RoleAssignorSidebar />
            <RoleAssignorDetails />
        </ContentLayout>
      </div>

      <RoleAssignorAddModal />
    </>
  );
}

export default RoleAssignorPage;
