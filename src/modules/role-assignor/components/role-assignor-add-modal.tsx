"use client";

import { Shield } from "lucide-react";
import { TypeButton, TypeCheckbox, TypeSearch } from "shared-lib-web";
import { useRoleAssignorAddModal } from "./role-assignor-add-modal.ts";

export function RoleAssignorAddModal() {
  const {
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
    selectedIds,
    unassignedProfiles,
    handleClose,
  } = useRoleAssignorAddModal();

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-4">
      <div
        className={`fixed inset-0 bg-base-content/40 backdrop-blur-xs transition-opacity ${
          isSubmitting ? "pointer-events-none" : ""
        }`}
        role="button"
        tabIndex={isSubmitting ? -1 : 0}
        aria-label={label("ui.close", "Close")}
        onClick={handleClose}
        onKeyDown={(event) => {
          if (
            !isSubmitting &&
            (event.key === "Enter" || event.key === " ")
          ) {
            handleClose();
          }
        }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-assignor-add-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 text-base-content shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 bg-base-200 p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
              <Shield size={20} />
            </div>
            <div className="min-w-0">
              <h3
                id="role-assignor-add-title"
                className="truncate text-base font-bold text-base-content"
              >
                {label("add_profile_to_role", "Add Profile to Role")}
              </h3>
              <p className="truncate text-xs text-base-content/60">
                {label("nav.roles", "Role")}:{" "}
                <span className="font-semibold text-primary">{role.name}</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <TypeButton {...assignButtonProps} />
            <TypeButton {...closeButtonProps} />
          </div>
        </header>

        <div className="shrink-0 space-y-3 border-b border-base-300 bg-base-100 p-4">
          <div>
            <TypeSearch {...searchProps} />
          </div>

          <div className="flex items-center justify-between px-1 text-xs text-base-content/60">
            <span>
              {selectedIds.length > 0 ? (
                <span className="font-semibold text-primary">
                  {selectedIds.length} {label("selected", "selected")}
                </span>
              ) : (
                <span>
                  {unassignedProfiles.length}{" "}
                  {label("available_profiles", "available profiles")}
                </span>
              )}
            </span>

            {unassignedProfiles.length > 0 && (
              <TypeButton {...selectAllButtonProps} />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 divide-y divide-base-300 overflow-y-auto p-4">
          {loadingProfiles ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse space-y-1.5 rounded-xl border border-base-300 p-3"
                >
                  <div className="h-3.5 w-1/2 rounded-md bg-base-200" />
                  <div className="h-2.5 w-3/4 rounded-md bg-base-200/70" />
                </div>
              ))}
            </div>
          ) : unassignedProfiles.length === 0 ? (
            <div className="px-4 py-12 text-center text-xs text-base-content/50">
              {searchTerm
                ? label("no_matching_profiles", "No profiles match your search.")
                : label(
                    "all_profiles_assigned",
                    "All profiles already have this role.",
                  )}
            </div>
          ) : (
            unassignedProfiles.map((profile) => {
              const isChecked = selectedIds.includes(profile.id);
              return (
                <label
                  key={profile.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 pt-2 transition-colors first:pt-0 ${
                    isChecked
                      ? "border-primary/30 bg-primary/10"
                      : "border-transparent hover:bg-base-200"
                  }`}
                >
                  <TypeCheckbox {...profileCheckboxProps[profile.id]} />
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs font-bold text-base-content/70">
                    {(profile.name || "U")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-base-content">
                      {profile.name}
                    </p>
                    <div className="flex items-center gap-2 truncate text-[11px] text-base-content/50">
                      {profile.email && <span>{profile.email}</span>}
                      {profile.mobile && <span>• {profile.mobile}</span>}
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
