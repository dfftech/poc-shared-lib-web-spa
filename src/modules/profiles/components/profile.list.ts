import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { canAccessPath, useCurrentPage } from "shared-lib-web";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import { editModeUpdate } from "../hooks/service";
import { profileListIsLoading } from "../hooks/service-http";
import { countryLoadCall } from "../hooks/service-load";

export function useProfileList() {
  useSignals();
  const { t } = useProfileTranslation();
  const pathname = useCurrentPage();
  const canCreate = canAccessPath("create", pathname);
  const canWrite = canAccessPath("update", pathname);
  const canDelete = canAccessPath("delete", pathname);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    countryLoadCall();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  }, []);

  const onAddNew = useCallback(() => {
    if (!canAccessPath("create", pathname)) return;
    editModeUpdate(undefined, "add");
  }, [pathname]);

  const searchProps = useMemo(
    () => ({
      placeholder: t("profileSearchPlaceholder", "Search by name, email, phone..."),
      value: searchTerm,
      onChange: onSearch,
      className: "w-64 max-w-full",
    }),
    [t, searchTerm, onSearch]
  );

  const addNewProps = useMemo(
    () => ({
      action: "primary" as const,
      label: t("user.add"),
      name: "UserPlus" as const,
      onPress: onAddNew,
      className: "shadow-xs bg-primary hover:bg-primary-focus text-primary-content shrink-0",
    }),
    [t, onAddNew]
  );

  return {
    searchProps,
    addNewProps,
    loading: profileListIsLoading.value,
    searchTerm,
    debouncedSearchTerm,
    canCreate,
    canWrite,
    canDelete,
  };
}
