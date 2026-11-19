import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  canAccessPath,
  EmptyState,
  SkeletonTable,
  useCurrentPage,
} from "shared-lib-web";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import { editModeUpdate, profileIsEditMode, profileIsPopupOpen, profileSelectedId, SelectedProfile } from "../hooks/service";
import {
  profileListCall,
  profileSaveCall,
  profileStatusCall,
} from "../hooks/service-http";
import { profileListIsLoading } from "../hooks/service-http";
import type { ProfileGridProps, ProfileType } from "../hooks/types";
import { ProfileRoleDisplay } from "./profile-role-display";

export type { ProfileGridProps };

type ProfileAction = "edit" | "status" | "view" | "delete";

interface ProfileColumn {
  key: keyof ProfileType & string;
  headerKey: string;
  className?: string;
  render?: (profile: ProfileType) => ReactNode;
}

function isProfileRows(value: unknown): value is ProfileType[] {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        typeof row === "object" &&
        row !== null &&
        "id" in row &&
        typeof row.id === "string" &&
        "name" in row &&
        typeof row.name === "string",
    )
  );
}

export function ProfileGrid({
  searchTerm = "",
  statusFilter = "all",
  personaFilter = "all",
  langFilter = "all",
}: ProfileGridProps) {
  useSignals();
  const { t } = useProfileTranslation();
  const pathname = useCurrentPage();
  const [rows, setRows] = useState<ProfileType[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void profileListCall({
      searchTerm,
      status: statusFilter,
      persona: personaFilter,
      lang: langFilter,
    }).then((response) => {
      if (active) {
        setRows(isProfileRows(response?.data) ? response.data : []);
      }
    });
    return () => {
      active = false;
    };
  }, [searchTerm, statusFilter, personaFilter, langFilter, refreshKey]);

  const handleAction = useCallback(
    async (profile: ProfileType, action: ProfileAction) => {
      if (action === "view") {
        SelectedProfile.value = profile;
        profileSelectedId.value = profile.id;
        profileIsEditMode.value = false;
        profileIsPopupOpen.value = true;
        await editModeUpdate(profile.id);
        return;
      }
      if (action === "edit") {
        if (!canAccessPath("update", pathname)) return;
        await editModeUpdate(profile.id, "edit");
        return;
      }
      if (action === "status") {
        if (!canAccessPath("update", pathname)) return;
        await profileStatusCall(profile.id, !profile.active);
        setRefreshKey((key) => key + 1);
        return;
      }
      if (!canAccessPath("delete", pathname)) return;
      if (window.confirm(t("deleteProfileConfirm", "Are you sure you want to delete this profile?"))) {
        await profileSaveCall({ ...profile, active: false });
        setRefreshKey((key) => key + 1);
      }
    },
    [pathname, t],
  );

  const columns = useMemo<ProfileColumn[]>(
    () => [
      { key: "name", headerKey: "user.name" },
      { key: "email", headerKey: "user.email" },
      {
        key: "mobile",
        headerKey: "user.phone",
        render: (profile) =>
          profile.mobile
            ? `${profile.telCode ? `+${profile.telCode.replace(/^\+/, "")} ` : ""}${profile.mobile}`
            : "—",
      },
      {
        key: "roles",
        headerKey: "nav.roles",
        render: (profile) => <ProfileRoleDisplay roles={profile.roles} />,
      },
      {
        key: "active",
        headerKey: "user.status",
        render: (profile) => (
          <span className={profile.active ? "text-success" : "text-base-content/60"}>
            {profile.active ? t("active", "Active") : t("inactive", "Inactive")}
          </span>
        ),
      },
      {
        key: "id",
        headerKey: "actions",
        className: "whitespace-nowrap",
        render: (profile) => (
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => void handleAction(profile, "view")}>
              {t("view", "View")}
            </button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => void handleAction(profile, "edit")}>
              {t("edit", "Edit")}
            </button>
            <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => void handleAction(profile, "delete")}>
              {t("delete", "Delete")}
            </button>
          </div>
        ),
      },
    ],
    [handleAction, t],
  );

  return (
    <div className="w-full flex-1 min-h-[450px] overflow-hidden rounded-xl border border-base-300 bg-base-100">
      {profileListIsLoading.value ? (
        <SkeletonTable />
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full bg-base-100">
            <thead className="bg-base-200 text-base-content">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={column.className}>
                    {t(column.headerKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState titleKey="ui.noData" />
                  </td>
                </tr>
              ) : (
                rows.map((profile) => (
                  <tr key={profile.id} className="text-base-content">
                    {columns.map((column) => {
                      const value = profile[column.key];
                      return (
                        <td key={column.key} className={column.className}>
                          {column.render
                            ? column.render(profile)
                            : value === null || value === undefined
                              ? "—"
                              : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProfileGrid;
