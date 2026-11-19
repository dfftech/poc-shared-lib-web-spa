import { useMemo, useState, useCallback } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { canAccessPath, useCurrentPage } from "shared-lib-web";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import {
  SelectedProfile,
  editModeUpdate,
  profileSelectedId,
} from "../hooks/service";

export function useProfileView() {
  useSignals();
  const { t } = useProfileTranslation();
  const pathname = useCurrentPage();
  const canUpdate = canAccessPath("update", pathname);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const profile = SelectedProfile.value;

  const onCancel = useCallback(() => {
    editModeUpdate(undefined);
  }, []);

  const onEdit = useCallback(() => {
    if (profileSelectedId.value) {
      editModeUpdate(profileSelectedId.value, "edit");
    }
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cancelProps = useMemo(
    () => ({
      action: "secondary" as const,
      label: t("close"),
      name: "X" as const,
      onPress: onCancel,
      type: "button" as const,
    }),
    [t, onCancel]
  );

  const editActionProps = useMemo(
    () => ({
      action: "primary" as const,
      label: t("editProfile"),
      name: "Pencil" as const,
      disabled: !canUpdate,
      onPress: onEdit,
      type: "button" as const,
      className: "btn-sm bg-primary hover:bg-primary-focus text-primary-content",
    }),
    [t, onEdit]
  );

  return {
    profile,
    canUpdate,
    cancelProps,
    editActionProps,
    copiedKey,
    copyToClipboard,
  };
}
