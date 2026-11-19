"use client";

import { TypeIcon, TypeSelect } from "shared-lib-web";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMenuRoles, type MenuRolesProps } from "./menu-roles.ts";
import { RoleAddInline } from "./role-add-inline.tsx";

export type { MenuRolesProps };

export function MenuRoles(props: MenuRolesProps) {
  useSignals();
  const {
    canCreate,
    canUpdate,
    roleSelectProps,
    addRoleButtonProps,
    editRoleButtonProps,
    roleToEditId,
    roleToEditName,
    isAddRoleOpen,
    handleCloseAddRole,
    onRoleCreated,
  } = useMenuRoles(props);
  const { control, setValue, watch } = useForm<{ roleId: string }>({
    defaultValues: { roleId: roleSelectProps.value },
  });

  useEffect(() => {
    setValue("roleId", roleSelectProps.value);
  }, [roleSelectProps.value, setValue]);

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (name === "roleId" && type === "change") {
        roleSelectProps.onChange(values.roleId ?? "");
      }
    });
    return () => subscription.unsubscribe();
  }, [roleSelectProps.onChange, watch]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-48 sm:w-60">
          <TypeSelect
            control={control}
            name="roleId"
            label="Role"
            options={roleSelectProps.options.map((option) => ({
              key: option.value,
              label: option.label,
            }))}
            className="w-full [&>label]:sr-only"
          />
        </div>
        {canUpdate && <TypeIcon {...editRoleButtonProps} />}
        {canCreate && <TypeIcon {...addRoleButtonProps} />}
      </div>

      <RoleAddInline
        isOpen={isAddRoleOpen || Boolean(roleToEditId)}
        roleId={roleToEditId}
        roleName={roleToEditName}
        onClose={handleCloseAddRole}
        onCreated={onRoleCreated}
      />
    </>
  );
}

export default MenuRoles;
