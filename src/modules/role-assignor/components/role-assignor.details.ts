import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useMemo, type ChangeEvent } from "react";
import { useCurrentPage } from "shared-lib-web";
import { checkMenuPermission } from "../../menu/menu-access/hooks/service.ts";
import {
  openAddProfileModal,
  profilesSearchTerm,
  reloadRoleProfiles,
  removeRoleFromProfile,
  roleAssignActionLoading,
  roleProfiles,
  roleProfilesLoading,
  selectedRole,
} from "../hooks/service";
import { useRoleAssignorTranslation } from "../hooks/use-role-assignor-translation.ts";

export function useRoleAssignorDetails() {
  useSignals();
  const { label } = useRoleAssignorTranslation();
  const pathname = useCurrentPage();
  const canCreate = checkMenuPermission(pathname, "create");
  const canDelete = checkMenuPermission(pathname, "delete");
  const role = selectedRole.value;
  const profiles = roleProfiles.value;
  const loading = roleProfilesLoading.value;
  const isRemoving = roleAssignActionLoading.value;
  const searchTerm = profilesSearchTerm.value;
  const filteredProfiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter((profile) =>
      [profile.name, profile.email, profile.mobile].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [profiles, searchTerm]);

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    profilesSearchTerm.value = event.currentTarget.value;
  }, []);

  const searchProps = useMemo(
    () => ({
      name: "profile-search",
      label: label(
        "search_profiles_placeholder",
        "Search profiles by name, email, or mobile...",
      ),
      value: searchTerm,
      onChange: onSearch,
      className: "w-full rounded-xl border-base-300 bg-base-100",
    }),
    [label, onSearch, searchTerm],
  );

  const handleRemoveRole = useCallback(
    async (profileId: string, name?: string) => {
      if (!profileId) return;
      const confirmMsg = `Are you sure you want to remove this role from ${
        name || "this profile"
      }?`;
      if (!confirm(confirmMsg)) return;
      await removeRoleFromProfile(profileId);
    },
    [],
  );

  const refreshButtonProps = useMemo(
    () => ({
      type: "button" as const,
      onPress: () => void reloadRoleProfiles(),
      disabled: loading,
      isLoading: loading,
      icon: "RotateCw" as const,
      label: label("user.reload", "Refresh"),
      size: "sm" as const,
      className: "gap-1.5 text-xs font-semibold shadow-2xs",
    }),
    [label, loading],
  );

  const addProfileButtonProps = useMemo(
    () => ({
      type: "button" as const,
      onPress: openAddProfileModal,
      icon: "Plus" as const,
      label: label("add_profile_to_role", "Add Profile to Role"),
      size: "sm" as const,
      className: "gap-1.5 text-xs font-bold shadow-xs",
    }),
    [label],
  );

  const removeProfileButtonProps = useMemo(
    () => ({
      action: "ghost" as const,
      icon: "Trash2" as const,
      label: label("unassign", "Remove"),
      size: "xs" as const,
      disabled: isRemoving,
      isIconOnly: true,
      className:
        "p-0.5 text-base-content/50 hover:text-error hover:bg-error/10",
    }),
    [isRemoving, label],
  );

  return {
    label,
    role,
    profiles,
    loading,
    isRemoving,
    searchTerm,
    filteredProfiles,
    searchProps,
    refreshButtonProps,
    addProfileButtonProps,
    removeProfileButtonProps,
    canCreate,
    canDelete,
    openAddProfileModal,
    reloadRoleProfiles,
    setSearchTerm: (value: string) => {
      profilesSearchTerm.value = value;
    },
    handleRemoveRole,
  };
}
