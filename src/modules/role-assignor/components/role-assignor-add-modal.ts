import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm, type Path } from "react-hook-form";
import {
  allProfilesLoading,
  closeAddProfileModal,
  isAddProfileModalOpen,
  reloadRoleProfiles,
  roleAssignActionLoading,
  roleProfiles,
  selectedRole,
} from "../hooks/service";
import {
  assignRoleToProfiles,
  fetchAllProfiles,
} from "../hooks/service-http";
import type { ProfileType } from "../hooks/types";
import { useRoleAssignorTranslation } from "../hooks/use-role-assignor-translation.ts";

export function useRoleAssignorAddModal() {
  useSignals();
  const { label } = useRoleAssignorTranslation();
  const role = selectedRole.value;
  const isOpen = isAddProfileModalOpen.value;
  const isSubmitting = roleAssignActionLoading.value;
  const currentAssigned = roleProfiles.value;
  const loadingProfiles = allProfilesLoading.value;

  const [allProfilesList, setAllProfilesList] = useState<ProfileType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { control, setValue, watch } = useForm<Record<string, boolean>>({
    defaultValues: {},
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedIds([]);
    setSearchTerm("");
    void fetchAllProfiles().then(setAllProfilesList);
  }, [isOpen]);

  const assignedIdSet = useMemo(
    () => new Set(currentAssigned.map((profile) => profile.id)),
    [currentAssigned],
  );
  const unassignedProfiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allProfilesList.filter((profile) => {
      if (assignedIdSet.has(profile.id)) return false;
      if (!term) return true;
      return [profile.name, profile.email, profile.mobile].some((value) =>
        value?.toLowerCase().includes(term),
      );
    });
  }, [allProfilesList, assignedIdSet, searchTerm]);

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  }, []);

  useEffect(() => {
    unassignedProfiles.forEach((profile) => {
      setValue(
        profile.id as Path<Record<string, boolean>>,
        selectedIds.includes(profile.id),
        { shouldDirty: false },
      );
    });
  }, [selectedIds, setValue, unassignedProfiles]);

  useEffect(() => {
    const subscription = watch((values) => {
      unassignedProfiles.forEach((profile) => {
        const checked = Boolean(values[profile.id]);
        setSelectedIds((previous) => {
          const isSelected = previous.includes(profile.id);
          if (checked && !isSelected) return [...previous, profile.id];
          if (!checked && isSelected) {
            return previous.filter((id) => id !== profile.id);
          }
          return previous;
        });
      });
    });
    return () => subscription.unsubscribe();
  }, [unassignedProfiles, watch]);

  const profileCheckboxProps = useMemo(() => {
    const props: Record<
      string,
      {
        control: typeof control;
        name: Path<Record<string, boolean>>;
        label: string;
        className: string;
      }
    > = {};
    unassignedProfiles.forEach((profile) => {
      props[profile.id] = {
        control,
        name: profile.id as Path<Record<string, boolean>>,
        label: "",
        className:
          "m-0 [&>label]:justify-center [&>label]:gap-0 [&>label]:p-0 [&>label>span]:hidden [&>p]:hidden",
      };
    });
    return props;
  }, [control, unassignedProfiles]);

  const searchProps = useMemo(
    () => ({
      name: "add-profile-search",
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

  const handleSelectAll = useCallback(() => {
    setSelectedIds((previous) =>
      previous.length === unassignedProfiles.length
        ? []
        : unassignedProfiles.map((profile) => profile.id),
    );
  }, [unassignedProfiles]);
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    closeAddProfileModal();
    setSelectedIds([]);
    setSearchTerm("");
  }, [isSubmitting]);
  const handleAssign = useCallback(async () => {
    if (!role?.id || selectedIds.length === 0) return;
    const selectedProfiles = allProfilesList.filter((profile) =>
      selectedIds.includes(profile.id),
    );
    if (await assignRoleToProfiles(role.id, selectedProfiles)) {
      await reloadRoleProfiles();
      handleClose();
    }
  }, [allProfilesList, handleClose, role?.id, selectedIds]);

  const assignButtonProps = useMemo(
    () => ({
      type: "button" as const,
      onPress: handleAssign,
      disabled: isSubmitting || selectedIds.length === 0,
      isLoading: isSubmitting,
      icon: "Check" as const,
      label: `${label("assign_role", "Assign Role")}${
        selectedIds.length > 0 ? ` (${selectedIds.length})` : ""
      }`,
      size: "sm" as const,
      className: "gap-1.5 text-xs font-bold shadow-xs",
    }),
    [handleAssign, isSubmitting, label, selectedIds.length],
  );

  const closeButtonProps = useMemo(
    () => ({
      type: "button" as const,
      onPress: handleClose,
      disabled: isSubmitting,
      icon: "X" as const,
      label: label("ui.close", "Close"),
      size: "sm" as const,
      isIconOnly: true,
      className: "btn-circle",
    }),
    [handleClose, isSubmitting, label],
  );

  const selectAllButtonProps = useMemo(
    () => ({
      type: "button" as const,
      onPress: handleSelectAll,
      label:
        selectedIds.length === unassignedProfiles.length
          ? label("unselect_all", "Unselect All")
          : label("select_all", "Select All"),
      size: "xs" as const,
      action: "ghost" as const,
      className: "px-1 text-xs font-semibold",
    }),
    [handleSelectAll, label, selectedIds.length, unassignedProfiles.length],
  );

  return {
    label,
    role,
    isOpen,
    isSubmitting,
    loadingProfiles,
    searchTerm,
    searchProps,
    profileCheckboxProps,
    assignButtonProps,
    closeButtonProps,
    selectAllButtonProps,
    setSearchTerm,
    selectedIds,
    unassignedProfiles,
    handleSelectAll,
    handleClose,
    handleAssign,
  };
}
