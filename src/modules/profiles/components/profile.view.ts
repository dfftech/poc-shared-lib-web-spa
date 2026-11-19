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
  const copyToClipboard = useCallback((text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const cancelProps = useMemo(
    () => ({
      action: "ghost" as const,
      label: t("close"),
      icon: "X" as const,
      isIconOnly: true,
      onPress: onCancel,
      type: "button" as const,
      className: "btn-circle opacity-70 hover:opacity-100 hover:bg-base-200",
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

  const emailCopyButtonProps = useMemo(
    () => ({
      action: "ghost" as const,
      label: t("copyEmail", "Copy email"),
      icon: copiedKey === "email" ? "Check" as const : "Copy" as const,
      isIconOnly: true,
      onPress: () => copyToClipboard(profile?.email || "", "email"),
      className: "btn-square btn-ghost opacity-60 hover:opacity-100",
    }),
    [copiedKey, copyToClipboard, profile?.email, t],
  );

  const phoneCopyButtonProps = useMemo(
    () => ({
      action: "ghost" as const,
      label: t("copyMobile", "Copy mobile"),
      icon: copiedKey === "phone" ? "Check" as const : "Copy" as const,
      isIconOnly: true,
      onPress: () => {
        const phone = `+${String(profile?.telCode || "").replace(/^\+/, "")}${profile?.mobile || ""}`;
        copyToClipboard(phone, "phone");
      },
      className: "btn-square btn-ghost opacity-60 hover:opacity-100",
    }),
    [copiedKey, copyToClipboard, profile?.mobile, profile?.telCode, t],
  );

  return {
    profile,
    canUpdate,
    cancelProps,
    editActionProps,
    emailCopyButtonProps,
    phoneCopyButtonProps,
    copiedKey,
    copyToClipboard,
  };
}
