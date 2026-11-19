"use client";

import { Mail, Phone, Shield, Users } from "lucide-react";
import { TypeButton, TypeSearch } from "shared-lib-web";
import { useRoleAssignorDetails } from "./role-assignor.details.ts";

export function RoleAssignorDetails() {
  const {
    label,
    role,
    profiles,
    loading,
    filteredProfiles,
    searchProps,
    refreshButtonProps,
    addProfileButtonProps,
    removeProfileButtonProps,
    canCreate,
    canDelete,
    handleRemoveRole,
  } = useRoleAssignorDetails();

  if (!role) {
    return (
      <div className="flex h-[calc(100vh-11.5rem)] min-h-[560px] flex-1 flex-col items-center justify-center rounded-box border border-base-300 bg-base-100 p-12 text-center text-base-content shadow-sm">
        <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
          <Shield size={28} />
        </div>
        <h3 className="text-base font-bold text-base-content">
          {label("no_role_selected_title", "No Role Selected")}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-base-content/60">
          {label(
            "no_role_selected_desc",
            "Please select a role from the left sidebar to view and assign profiles.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-11.5rem)] min-h-[560px] w-full min-w-0 flex-1 flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 text-base-content shadow-sm">
      {/* Detail Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-base-300 bg-base-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-base-content">
                {role.name}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {profiles.length}{" "}
                {profiles.length === 1
                  ? label("profile", "profile")
                  : label("profiles", "profiles")}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-base-content/50">
              Key: {role.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <TypeButton {...refreshButtonProps} />

          {canCreate && (
            <TypeButton {...addProfileButtonProps} />
          )}
        </div>
      </div>

      {/* Profiles Search & Controls */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-base-300 bg-base-200/50 px-6 py-3">
        <div className="max-w-sm flex-1">
          <TypeSearch {...searchProps} />
        </div>

        <span className="shrink-0 text-xs font-medium text-base-content/50">
          {filteredProfiles.length}{" "}
          {label("assigned_profiles", "assigned profiles")}
        </span>
      </div>

      {/* Profiles List Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && profiles.length === 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="animate-pulse space-y-2 rounded-2xl border border-base-300 bg-base-200/40 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-base-200" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="h-3.5 w-1/2 rounded-md bg-base-200" />
                    <div className="h-2.5 w-3/4 rounded-md bg-base-200/70" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
              <Users size={24} />
            </div>
            <h4 className="text-sm font-bold text-base-content">
              {label(
                "no_profiles_for_role",
                "No Profiles Assigned to this Role",
              )}
            </h4>
            <p className="mt-1 max-w-sm text-xs text-base-content/60">
              {label(
                "no_profiles_for_role_desc",
                "There are no profiles currently linked to this role. Click the button above to assign profiles.",
              )}
            </p>
            {canCreate && (
              <TypeButton
                {...addProfileButtonProps}
                className="mt-4 gap-1.5 text-xs font-semibold"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-3.5">
            {filteredProfiles.map((profile) => {
              const initials = (profile.name || "U")
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={profile.id}
                  className="group flex min-w-[275px] items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-3.5 transition-all hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4
                        className="truncate text-xs font-bold text-base-content"
                        title={profile.name}
                      >
                        {profile.name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        {profile.active !== false ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                            <span className="size-1 rounded-full bg-success" />
                            {label("user.active", "Active")}
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-base-300 bg-base-200 px-1.5 py-0.5 text-[10px] font-semibold text-base-content/60">
                            {label("user.inactive", "Inactive")}
                          </span>
                        )}
                        {canDelete && (
                          <TypeButton
                            {...removeProfileButtonProps}
                            onPress={(event) => {
                              event.stopPropagation();
                              void handleRemoveRole(
                                profile.id,
                                profile.name || profile.email,
                              );
                            }}
                            className="opacity-0 transition-all group-hover:opacity-100"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 truncate text-xs text-base-content/70">
                      <Mail
                        size={12}
                        className="shrink-0 text-base-content/50"
                      />
                      {profile.email ? (
                        <a
                          href={`mailto:${profile.email}`}
                          className="hover:underline hover:text-primary truncate"
                          title={profile.email}
                        >
                          {profile.email}
                        </a>
                      ) : (
                        <span className="text-base-content/50">—</span>
                      )}
                    </div>

                    {profile.mobile && (
                      <div className="flex items-center gap-1.5 truncate text-[11px] text-base-content/70">
                        <Phone
                          size={11}
                          className="shrink-0 text-base-content/50"
                        />
                        <span className="truncate">
                          {profile.telCode ? `${profile.telCode} ` : ""}
                          {profile.mobile}
                        </span>
                      </div>
                    )}

                    {profile.id && (
                      <p
                        className="truncate pt-0.5 font-mono text-[10px] text-base-content/50"
                        title={profile.id}
                      >
                        ID: {profile.id}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
