"use client";

import { ChevronRight, Shield } from "lucide-react";
import { TypeSearch } from "shared-lib-web";
import { useRoleAssignorSidebar } from "./role-assignor.sidebar.ts";

export function RoleAssignorSidebar() {
  const {
    label,
    roles,
    selected,
    searchProps,
    isLoading,
    filteredRoles,
    selectRole,
  } = useRoleAssignorSidebar();

  return (
    <div className="flex h-[calc(100vh-11.5rem)] min-h-[560px] w-full shrink-0 flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm lg:w-72 xl:w-80">
      {/* Header with Search */}
      <div className="border-b border-base-300 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-base-content">
            <Shield size={16} className="text-primary" />
            <span>{label("nav.roles", "Roles")}</span>
          </h3>
          <span className="text-xs font-medium text-base-content/50">
            {filteredRoles.length}{" "}
            {filteredRoles.length === 1
              ? label("item", "item")
              : label("items", "items")}
          </span>
        </div>

        <div className="mt-2.5">
          <TypeSearch {...searchProps} />
        </div>
      </div>

      {/* Roles List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && roles.length === 0 ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse space-y-1.5 rounded-xl border border-base-300 p-3">
                <div className="h-3.5 w-3/4 rounded-md bg-base-200" />
                <div className="h-2.5 w-1/2 rounded-md bg-base-200/70" />
              </div>
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="px-4 py-12 text-center text-xs text-base-content/50">
            {label("no_roles_found", "No roles found")}
          </div>
        ) : (
          filteredRoles.map((role) => {
            const isSelected = selected?.id === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => selectRole(role)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? "border-primary/30 bg-primary/10 font-semibold text-primary shadow-2xs"
                    : "border-transparent text-base-content/80 hover:border-base-300 hover:bg-base-200"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold">{role.name}</span>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-base-content/50">
                    {role.id}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ChevronRight
                    size={14}
                    className={`text-base-content/50 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? "text-primary" : ""
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
