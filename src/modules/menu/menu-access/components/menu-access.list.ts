"use client";

import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useMemo, useRef, useState } from "react";
import { useCurrentPage } from "shared-lib-web";
import { useTranslation } from "../../hooks/use-menu-translation.ts";
import { adminRolesSignal, personaSignal } from "../../hooks/menu-context.ts";
import { checkMenuPermission } from "../hooks/service";
import { menuAccessSaveIsLoadingSignal } from "../hooks/service-http";
import type { MenuRole } from "../hooks/types";
import type { MenuAccessFormHandle } from "./menu-access.form";
import {
  setScreenRoute,
  useScreenRouteSearchParams,
} from "../../hooks/screen-route.ts";

export function useMenuAccessList() {
  useSignals();
  const { t } = useTranslation();
  const pathname = useCurrentPage();
  const searchParams = useScreenRouteSearchParams();

  const routeAction = searchParams.get("pathname");
  const routeRoleId = searchParams.get("id") || "";
  const [rememberedRoleId, setRememberedRoleId] = useState(routeRoleId);
  const [hasFormChanges, setHasFormChanges] = useState(false);

  const formRef = useRef<MenuAccessFormHandle>(null);

  const roles: MenuRole[] = adminRolesSignal.value.flatMap((role) => {
    const id = role.key || role.value;
    if (!id || role.disabled) return [];
    return [
      {
        id,
        name: role.label,
        persona: role.persona || personaSignal.value,
        active: true,
      },
    ];
  });
  const routeRoleExists = roles.some((role) => role.id === routeRoleId);
  const defaultRole =
    roles.find((role) => role.persona?.toLowerCase() === "admin") || roles[0];
  const activeSelectedRoleId = routeRoleExists
    ? routeRoleId
    : roles.some((role) => role.id === rememberedRoleId)
      ? rememberedRoleId
      : defaultRole?.id || "";

  const handleRoleCreated = useCallback(
    (roleId: string) => {
      setRememberedRoleId(roleId);
      setHasFormChanges(false);
      setScreenRoute("view", roleId);
    },
    [setHasFormChanges, setRememberedRoleId],
  );

  const handleRoleSelect = useCallback(
    (roleId: string) => {
      setRememberedRoleId(roleId);
      setHasFormChanges(false);
      setScreenRoute("view", roleId);
    },
    [setHasFormChanges, setRememberedRoleId],
  );

  const selectedRole = roles.find(
    (r: MenuRole) => r.id === activeSelectedRoleId,
  ) ||
    roles[0] || { id: "", name: t("loading"), persona: personaSignal.value };

  const canUpdate = checkMenuPermission(pathname, "update");
  const canCreate = checkMenuPermission(pathname, "create");

  const handlePermissionsChanged = useCallback(
    (changed: boolean) => {
      setHasFormChanges(changed);
    },
    [setHasFormChanges],
  );

  const handleSave = useCallback(async () => {
    await formRef.current?.save();
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setHasFormChanges(false);
    setScreenRoute();
  }, [setHasFormChanges]);

  const isSaveLoading = menuAccessSaveIsLoadingSignal.value;

  const submitButtonProps = useMemo(
    () => ({
      icon: "SendHorizontal" as const,
      onPress: hasFormChanges ? handleSave : undefined,
      label: t("saveChanges"),
      action: "primary" as const,
      isLoading: isSaveLoading,
      disabled: isSaveLoading || !hasFormChanges,
    }),
    [hasFormChanges, handleSave, isSaveLoading, t],
  );

  return {
    formRef,
    pathname,
    roles,
    selectedRoleId: activeSelectedRoleId,
    setSelectedRoleId: handleRoleSelect,
    selectedRole,
    isDrawerOpen:
      routeAction === "view" &&
      Boolean(routeRoleId && activeSelectedRoleId === routeRoleId),
    canUpdate,
    canCreate,
    handlePermissionsChanged,
    handleRoleCreated,
    handleCloseDrawer,
    submitButtonProps,
  };
}
