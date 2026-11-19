import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useMemo, type ChangeEvent } from "react";
import {
  rolesList,
  rolesListLoading,
  rolesSearchTerm,
  selectedRole,
  selectRole,
} from "../hooks/service";
import { useRoleAssignorTranslation } from "../hooks/use-role-assignor-translation.ts";

export function useRoleAssignorSidebar() {
  useSignals();
  const { label } = useRoleAssignorTranslation();
  const roles = rolesList.value;
  const selected = selectedRole.value;
  const searchTerm = rolesSearchTerm.value;
  const isLoading = rolesListLoading.value;
  const filteredRoles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((role) =>
      [role.name, role.id].some((value) =>
        value?.toLowerCase().includes(term),
      ),
    );
  }, [roles, searchTerm]);

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    rolesSearchTerm.value = event.currentTarget.value;
  }, []);

  const searchProps = useMemo(
    () => ({
      name: "role-search",
      label: label(
        "search_roles_placeholder",
        "Search roles by name or key...",
      ),
      value: searchTerm,
      onChange: onSearch,
      className: "w-full rounded-xl border-base-300 bg-base-100",
    }),
    [label, onSearch, searchTerm],
  );

  return {
    label,
    roles,
    selected,
    searchTerm,
    searchProps,
    isLoading,
    filteredRoles,
    setSearchTerm: (value: string) => {
      rolesSearchTerm.value = value;
    },
    selectRole,
  };
}
