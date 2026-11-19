"use client";

import { ContentLayout, HeadLayout, TypeButton } from "shared-lib-web";
import { useSignals } from "@preact/signals-react/runtime";
import { useTranslation } from "../../hooks/use-menu-translation.ts";
import { MenuRoles } from "../../roles/components/menu-roles.tsx";
import { MenuAccessForm } from "./menu-access.form.tsx";
import { useMenuAccessList } from "./menu-access.list.ts";

export function MenuAccessList() {
  useSignals();
  const { t } = useTranslation();
  const {
    formRef,
    roles,
    selectedRoleId,
    selectedRole,
    isDrawerOpen,
    canUpdate,
    canCreate,
    setSelectedRoleId,
    handlePermissionsChanged,
    handleRoleCreated,
    handleCloseDrawer,
    submitButtonProps,
  } = useMenuAccessList();

  return (
    <div className="w-full space-y-4">
      <HeadLayout
        title={t("nav.roles")}
        actions={
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <MenuRoles
              roles={roles}
              allRoles={roles}
              selectedRoleId={selectedRoleId}
              selectedRoleName={selectedRole.name}
              onRoleSelect={setSelectedRoleId}
              canCreate={canCreate}
              canUpdate={canUpdate}
              onRoleCreated={handleRoleCreated}
            />
            {canUpdate && !isDrawerOpen && (
              <TypeButton {...submitButtonProps} />
            )}
          </div>
        }
      />
      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-base-content/40"
            role="button"
            tabIndex={0}
            aria-label={t("close")}
            onClick={handleCloseDrawer}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                handleCloseDrawer();
            }}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-access-drawer-title"
            className="relative z-10 flex h-full w-full max-w-4xl flex-col border-l border-base-300 bg-base-100 text-base-content shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-base-300 px-5 py-4">
              <div>
                <h2 id="menu-access-drawer-title" className="text-lg font-bold">
                  {selectedRole.name}
                </h2>
                <p className="text-xs opacity-70">
                  {t("settings.navigation")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canUpdate && <TypeButton {...submitButtonProps} />}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleCloseDrawer}
                >
                  {t("close")}
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <MenuAccessForm
                ref={formRef}
                selectedRoleId={selectedRoleId}
                selectedRoleName={selectedRole.name}
                canUpdate={canUpdate}
                onPermissionsChange={handlePermissionsChanged}
              />
            </div>
          </section>
        </div>
      ) : (
        <ContentLayout>
          <div className="flex flex-col gap-6">
            <MenuAccessForm
              ref={formRef}
              selectedRoleId={selectedRoleId}
              selectedRoleName={selectedRole.name}
              canUpdate={canUpdate}
              onPermissionsChange={handlePermissionsChanged}
            />
          </div>
        </ContentLayout>
      )}
    </div>
  );
}

export default MenuAccessList;
