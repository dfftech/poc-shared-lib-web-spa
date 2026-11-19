import { AppHttp, ShowToast } from "shared-lib-web";
import { signal } from "@preact/signals-react";
import { ConstKeys } from "dff-util";
import { MsUrl } from "../../../config.ts";
import { refreshMenuNavigation } from "../../menu/hooks/menu-context.ts";
import { loadRolesCall } from "../../menu/roles/hooks/service-load.ts";
import {
  hasApiError,
  hasApiRows,
  isApiRecord,
  readApiRows,
} from "../../menu/hooks/api-response.ts";
import type { ProfileType, RoleItem } from "./types";

export const rolesListLoading = signal(false);
export const roleProfilesLoading = signal(false);
export const roleAssignActionLoading = signal(false);
export const allProfilesLoading = signal(false);

export const PROFILE_ROLE_SEARCH_ROUTE = `${MsUrl.utils}/profile-role-search`;
export const PROFILE_ROLE_ADD_ROUTE = `${MsUrl.utils}/profile-role-add`;
export const PROFILE_ROLE_DELETE_ROUTE = `${MsUrl.utils}/profile-role-delete`;

export async function fetchRolesList(): Promise<RoleItem[]> {
  rolesListLoading.value = true;
  try {
    const roles = await loadRolesCall();
    return roles.map((role) => ({
      id: role.id,
      key: role.id,
      value: role.id,
      name: role.name,
      label: role.name,
      persona: role.persona,
      active: role.active,
    }));
  } finally {
    rolesListLoading.value = false;
  }
}

export async function fetchProfilesByRole(
  roleId: string,
): Promise<ProfileType[]> {
  if (!roleId) return [];
  roleProfilesLoading.value = true;
  try {
    const response: unknown = await AppHttp.Post(PROFILE_ROLE_SEARCH_ROUTE, {
      roleId,
    });
    if (hasApiError(response)) {
      throw new Error(readErrorMessage(response));
    }
    if (!hasApiRows(response)) {
      throw new TypeError("The role profile response was not a list.");
    }
    return readApiRows(response).flatMap(toProfile);
  } catch (error) {
    ShowToast(errorMessage(error), "warning");
    return [];
  } finally {
    roleProfilesLoading.value = false;
  }
}

export async function fetchAllProfiles(
  searchTerm = "",
): Promise<ProfileType[]> {
  allProfilesLoading.value = true;
  try {
    const response: unknown = await AppHttp.Post(
      `${MsUrl.utils}/profile-search`,
      {
        skip: 0,
        limit: 100,
        searchTerm: searchTerm.trim(),
        orderBy: "updatedOn",
        order: "DESC",
      },
    );
    if (hasApiError(response)) {
      throw new Error(readErrorMessage(response));
    }
    if (!hasApiRows(response)) {
      throw new TypeError("The profile search response was not a list.");
    }
    return readApiRows(response).flatMap(toProfile);
  } catch (error) {
    ShowToast(errorMessage(error), "warning");
    return [];
  } finally {
    allProfilesLoading.value = false;
  }
}

export async function addRoleToProfile(
  profileId: string,
  roleId: string,
): Promise<boolean> {
  if (!profileId || !roleId) return false;
  try {
    const response: unknown = await AppHttp.Post(PROFILE_ROLE_ADD_ROUTE, {
      profileId,
      roleId,
    });
    if (hasApiError(response)) {
      throw new Error(readErrorMessage(response));
    }
    return true;
  } catch (error) {
    ShowToast(errorMessage(error), "error");
    return false;
  }
}

export async function assignRoleToProfiles(
  roleId: string,
  profiles: ProfileType[],
): Promise<boolean> {
  if (!roleId || profiles.length === 0) return false;
  roleAssignActionLoading.value = true;
  try {
    const responses: unknown[] = await Promise.all(
      profiles.map((profile) =>
        AppHttp.Post(PROFILE_ROLE_ADD_ROUTE, {
          profileId: profile.id,
          roleId,
        }),
      ),
    );
    if (responses.some(hasApiError)) {
      throw new Error("One or more profiles could not be assigned.");
    }
    ShowToast("Role assigned to profile(s) successfully", "success");
    await refreshNavigation();
    return true;
  } catch (error) {
    ShowToast(errorMessage(error), "error");
    return false;
  } finally {
    roleAssignActionLoading.value = false;
  }
}

export async function deleteRoleFromProfile(
  profileId: string,
  roleId: string,
): Promise<boolean> {
  if (!profileId || !roleId) return false;
  roleAssignActionLoading.value = true;
  try {
    const response: unknown = await AppHttp.Post(PROFILE_ROLE_DELETE_ROUTE, {
      profileId,
      roleId,
    });
    if (hasApiError(response)) {
      throw new Error(readErrorMessage(response));
    }
    ShowToast("Role removed from profile successfully", "success");
    await refreshNavigation();
    return true;
  } catch (error) {
    ShowToast(errorMessage(error), "error");
    return false;
  } finally {
    roleAssignActionLoading.value = false;
  }
}

async function refreshNavigation(): Promise<void> {
  try {
    await refreshMenuNavigation();
  } catch {
    ShowToast("Role assignment saved, but navigation could not be refreshed.", "warning");
  }
}

function toProfile(value: unknown): ProfileType[] {
  if (!isApiRecord(value) || typeof value.id !== "string") return [];
  const profile: ProfileType = {
    id: value.id,
    name: typeof value.name === "string" ? value.name : "",
    email: typeof value.email === "string" ? value.email : "",
    ...(typeof value.mobile === "string" ? { mobile: value.mobile } : {}),
    ...(typeof value.telCode === "string" ? { telCode: value.telCode } : {}),
    ...(typeof value.persona === "string" ? { persona: value.persona } : {}),
    ...(Array.isArray(value.roles)
      ? { roles: value.roles.filter((role): role is string => typeof role === "string") }
      : {}),
    ...(typeof value.active === "boolean" ? { active: value.active } : {}),
    ...(typeof value.createdAt === "string" || value.createdAt instanceof Date
      ? { createdAt: value.createdAt }
      : {}),
    ...(typeof value.updatedAt === "string" || value.updatedAt instanceof Date
      ? { updatedAt: value.updatedAt }
      : {}),
  };
  return [profile];
}

function readErrorMessage(value: unknown): string {
  if (!isApiRecord(value)) return ConstKeys.WENT_WRONG;
  if (typeof value.error === "string") return value.error;
  if (isApiRecord(value.error) && typeof value.error.message === "string") {
    return value.error.message;
  }
  return ConstKeys.WENT_WRONG;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : ConstKeys.WENT_WRONG;
}
