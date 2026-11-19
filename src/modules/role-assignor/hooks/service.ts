import { signal } from "@preact/signals-react";
import { setScreenRoute } from "../../menu/hooks/screen-route.ts";
import type { RoleItem, ProfileType } from "./types";
import {
  fetchProfilesByRole,
  fetchRolesList,
  assignRoleToProfiles,
  addRoleToProfile,
  deleteRoleFromProfile,
  rolesListLoading,
  roleProfilesLoading,
  roleAssignActionLoading,
  allProfilesLoading,
} from "./service-http";

export {
  rolesListLoading,
  roleProfilesLoading,
  roleAssignActionLoading,
  allProfilesLoading,
  assignRoleToProfiles,
  addRoleToProfile,
  deleteRoleFromProfile,
};

export const selectedRole = signal<RoleItem | null>(null);
export const rolesList = signal<RoleItem[]>([]);
export const roleProfiles = signal<ProfileType[]>([]);
export const rolesSearchTerm = signal<string>("");
export const profilesSearchTerm = signal<string>("");
export const isAddProfileModalOpen = signal<boolean>(false);

export const selectRole = async (role: RoleItem) => {
  selectedRole.value = role;
  setScreenRoute("view", role.id);
  if (role?.id) {
    const profiles = await fetchProfilesByRole(role.id);
    roleProfiles.value = profiles;
  } else {
    roleProfiles.value = [];
  }
};

export const openAddProfileModal = () => {
  isAddProfileModalOpen.value = true;
  setScreenRoute("create", selectedRole.value?.id, {
    mode: "assign-profile",
  });
};

export const closeAddProfileModal = () => {
  isAddProfileModalOpen.value = false;
  setScreenRoute(
    selectedRole.value?.id ? "view" : undefined,
    selectedRole.value?.id,
  );
};

export const reloadRoleProfiles = async () => {
  if (selectedRole.value?.id) {
    const profiles = await fetchProfilesByRole(selectedRole.value.id);
    roleProfiles.value = profiles;
  }
};

export const reloadRolesList = async (preferredRoleId?: string) => {
  const roles = await fetchRolesList();
  rolesList.value = roles;

  const preferredRole = preferredRoleId ? roles.find((role) => role.id === preferredRoleId) : undefined;
  if (preferredRole) {
    await selectRole(preferredRole);
  } else if (!selectedRole.value && roles.length > 0) {
    await selectRole(roles[0]);
  } else if (selectedRole.value) {
    const stillExists = roles.find((r) => r.id === selectedRole.value?.id);
    if (stillExists) {
      selectedRole.value = stillExists;
      await reloadRoleProfiles();
    } else if (roles.length > 0) {
      await selectRole(roles[0]);
    }
  }
};

export const removeRoleFromProfile = async (profileId: string) => {
  const role = selectedRole.value;
  if (!role?.id || !profileId) return false;
  const ok = await deleteRoleFromProfile(profileId, role.id);
  if (ok) {
    await reloadRoleProfiles();
  }
  return ok;
};
