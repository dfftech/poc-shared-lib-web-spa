import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "../../hooks/use-menu-translation.ts";
import { roleIsPopupOpen } from "../hooks/service";
import type { MenuRole } from "../hooks/types";
import {
  setScreenRoute,
  useScreenRouteSearchParams,
} from "../../hooks/screen-route.ts";

const subscribeMounted = () => () => {};
const mountedClientSnapshot = () => true;
const mountedServerSnapshot = () => false;

export interface MenuRolesProps {
  roles: MenuRole[];
  selectedRoleId: string;
  selectedRoleName: string;
  onRoleSelect: (roleId: string) => void;
  canCreate: boolean;
  canUpdate: boolean;
  allRoles?: MenuRole[];
  onRoleCreated?: (roleId: string) => void;
}

export function useMenuRoles({
  roles,
  selectedRoleId,
  selectedRoleName,
  onRoleSelect,
  canCreate,
  canUpdate,
  allRoles,
  onRoleCreated,
}: MenuRolesProps) {
  useSignals();
  const { t } = useTranslation();
  const searchParams = useScreenRouteSearchParams();
  const routeAction = searchParams.get("pathname");
  const routeId = searchParams.get("id");
  // Hydration guard: async role option caches may differ between SSR and
  // client. Render select options only after mount so the server HTML and
  // first client render always match.
  const isMounted = useSyncExternalStore(
    subscribeMounted,
    mountedClientSnapshot,
    mountedServerSnapshot,
  );
  const isAddRoleOpen = routeAction === "create";
  const roleToEditId =
    routeAction === "edit" && roles.some((role) => role.id === routeId)
      ? routeId || undefined
      : undefined;
  const roleToEditName =
    roles.find((role) => role.id === roleToEditId)?.name || selectedRoleName;

  const roleSelectProps = useMemo(
    () => ({
      value: isMounted ? selectedRoleId : "",
      options: isMounted
        ? roles.map((role: MenuRole) => ({
            key: role.id,
            value: role.id,
            label: role.name,
          }))
        : [],
      onChange: onRoleSelect,
    }),
    [selectedRoleId, roles, onRoleSelect, isMounted, t],
  );

  const handleAddRole = useCallback(() => {
    setScreenRoute("create");
  }, []);

  const handleEditRole = useCallback(() => {
    if (selectedRoleId) {
      onRoleSelect(selectedRoleId);
      setScreenRoute("edit", selectedRoleId);
    }
  }, [onRoleSelect, selectedRoleId]);

  const handleCloseAddRole = useCallback(() => {
    roleIsPopupOpen.value = false;
    const params = new URLSearchParams(window.location.search);
    const currentAction = params.get("pathname");
    const currentRoleId = params.get("id");
    if (currentAction !== "view") {
      if (currentAction === "edit" && currentRoleId)
        onRoleSelect(currentRoleId);
      setScreenRoute();
    }
  }, [onRoleSelect]);

  const addRoleButtonProps = useMemo(
    () => ({
      name: "CirclePlus" as const,
      size: 25,
      onClick: handleAddRole,
      title: t("createRole"),
      className:
        "text-primary cursor-pointer hover:opacity-80 transition-opacity",
    }),
    [handleAddRole, t],
  );

  const editRoleButtonProps = useMemo(
    () => ({
      name: "Pencil" as const,
      size: 19,
      onClick: handleEditRole,
      title: t("editRole"),
      disabled: !selectedRoleId,
      className:
        "text-primary cursor-pointer hover:opacity-80 transition-opacity",
    }),
    [handleEditRole, selectedRoleId, t],
  );

  return {
    canCreate,
    canUpdate,
    allRoles: allRoles || roles,
    roleSelectProps,
    handleAddRole,
    handleEditRole,
    addRoleButtonProps,
    editRoleButtonProps,
    roleToEditId,
    roleToEditName,
    isAddRoleOpen,
    handleCloseAddRole,
    onRoleCreated,
  };
}
