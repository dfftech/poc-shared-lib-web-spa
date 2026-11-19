import { localeSignal, resolveLucideIcon } from "shared-lib-web";
import { useSignals } from "@preact/signals-react/runtime";
import type { ForwardedRef } from "react";
import { useForm, type Path } from "react-hook-form";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  bulkUpdateMenuAccess,
  fetchRoleSpecificAccess,
  menuAccessIsLoadingSignal,
} from "../hooks/service-http";
import type { TransformedMenuAccessType } from "../hooks/types";
import { localizeMenuAccess } from "../../hooks/menu-context.ts";

export type Permission = {
  get: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export interface MenuAccessFormProps {
  selectedRoleId: string;
  selectedRoleName: string;
  canUpdate: boolean;
  onPermissionsChange?: (hasChanges: boolean) => void;
}

export type MenuAccessFormHandle = {
  save: () => Promise<void>;
  reset: () => void;
  hasChanges: boolean;
};

type PermissionCheckboxValues = Record<string, Permission>;

export function useMenuAccessForm(
  props: MenuAccessFormProps,
  ref: ForwardedRef<MenuAccessFormHandle>,
) {
  useSignals();
  const { selectedRoleId, selectedRoleName, canUpdate, onPermissionsChange } =
    props;

  const [menuAccessData, setMenuAccessData] = useState<
    TransformedMenuAccessType[]
  >([]);
  // Names follow the active UI language; the raw tree keeps nameLang for this.
  const lang = localeSignal.value;
  const localizedMenuAccessData = useMemo(
    () => localizeMenuAccess(menuAccessData, lang),
    [menuAccessData, lang],
  );
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    {},
  );
  const [originalPermissions, setOriginalPermissions] = useState<
    Record<string, Permission>
  >({});
  const { control, setValue, watch } = useForm<PermissionCheckboxValues>({
    defaultValues: {},
  });

  useEffect(() => {
    let ignore = false;
    if (!selectedRoleId) {
      void Promise.resolve().then(() => {
        if (!ignore) {
          setMenuAccessData([]);
          setPermissions({});
          setOriginalPermissions({});
        }
      });
      return () => {
        ignore = true;
      };
    }

    fetchRoleSpecificAccess(selectedRoleId).then((data) => {
      if (ignore) return;
      setMenuAccessData(data);

      const initial: Record<string, Permission> = {};
      const processItem = (item: TransformedMenuAccessType) => {
        if (item.id) {
          initial[item.id] = {
            get: item.permissions?.read || false,
            create: item.permissions?.create || false,
            update: item.permissions?.update || false,
            delete: item.permissions?.delete || false,
          };
        }
        item.children?.forEach(processItem);
      };
      data.forEach(processItem);

      setPermissions(initial);
      setOriginalPermissions(JSON.parse(JSON.stringify(initial)));
    });
  }, [selectedRoleId]);

  const hasChanges = useMemo(
    () => JSON.stringify(permissions) !== JSON.stringify(originalPermissions),
    [permissions, originalPermissions],
  );

  useEffect(() => {
    onPermissionsChange?.(hasChanges);
  }, [hasChanges, onPermissionsChange]);

  const applyPermissionChange = useCallback(
    (
      previous: Record<string, Permission>,
      featureId: string,
      permissionType: keyof Permission,
      nextValue?: boolean,
    ) => {
      const current = previous[featureId] || {
        get: false,
        create: false,
        update: false,
        delete: false,
      };
      const value =
        typeof nextValue === "boolean"
          ? nextValue
          : !current[permissionType];

      if (permissionType === "get" && !value) {
        return {
          ...previous,
          [featureId]: {
            get: false,
            create: false,
            update: false,
            delete: false,
          },
        };
      }

      if (permissionType !== "get" && value) {
        return {
          ...previous,
          [featureId]: {
            ...current,
            get: true,
            [permissionType]: true,
          },
        };
      }

      return {
        ...previous,
        [featureId]: {
          ...current,
          [permissionType]: value,
        },
      };
    },
    [],
  );

  const handlePermissionChange = useCallback(
    (featureId: string, permissionType: keyof Permission) => {
      setPermissions((previous) =>
        applyPermissionChange(previous, featureId, permissionType),
      );
    },
    [applyPermissionChange],
  );

  useEffect(() => {
    Object.entries(permissions).forEach(([id, permission]) => {
      (["get", "create", "update", "delete"] as const).forEach((permissionType) => {
        setValue(
          `${id}.${permissionType}` as never,
          permission[permissionType] as never,
          { shouldDirty: false },
        );
      });
    });
  }, [permissions, setValue]);

  useEffect(() => {
    const subscription = watch((values) => {
      setPermissions((previous) => {
        let next = previous;
        const checkboxValues = values as PermissionCheckboxValues;
        for (const [id, permission] of Object.entries(checkboxValues)) {
          if (!permission) continue;
          (["get", "create", "update", "delete"] as const).forEach((permissionType) => {
            const value = permission[permissionType];
            if (typeof value === "boolean" &&
                previous[id]?.[permissionType] !== value) {
              next = applyPermissionChange(next, id, permissionType, value);
            }
          });
        }
        return next;
      });
    });
    return () => subscription.unsubscribe();
  }, [applyPermissionChange, watch]);

  const permissionCheckboxProps = useMemo(() => {
    const props: Record<string, {
      control: typeof control;
      name: Path<PermissionCheckboxValues>;
      label: string;
      disabled: boolean;
      className: string;
    }> = {};

    const processItem = (item: TransformedMenuAccessType) => {
      if (item.id) {
        (["get", "create", "update", "delete"] as const).forEach((permissionType) => {
          props[`${item.id}.${permissionType}`] = {
            control,
            name: `${item.id}.${permissionType}` as Path<PermissionCheckboxValues>,
            label: "",
            disabled: !canUpdate,
            className:
              "m-0 flex justify-center [&>label]:justify-center [&>label]:gap-0 [&>label]:p-0 [&>label>span]:hidden [&>p]:hidden",
          };
        });
      }
      item.children?.forEach(processItem);
    };
    menuAccessData.forEach(processItem);
    return props;
  }, [canUpdate, control, menuAccessData]);

  const iconProps = useMemo(() => {
    const props: Record<string, { name: string; size: number; className?: string }> = {};
    const processItem = (item: TransformedMenuAccessType) => {
      if (item.id) {
        props[item.id] = {
          name: resolveLucideIcon(item.icon),
          size: 18,
        };
      }
      item.children?.forEach((child) => {
        if (child.id) {
          props[child.id] = {
            name: resolveLucideIcon(child.icon),
            size: 16,
            className: "text-base-content/60",
          };
        }
      });
    };
    menuAccessData.forEach(processItem);
    return props;
  }, [menuAccessData]);

  const handleReset = useCallback(() => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
  }, [originalPermissions]);

  const handleSave = useCallback(async () => {
    const updates = [];
    for (const [id, perm] of Object.entries(permissions)) {
      const original = originalPermissions[id];
      if (JSON.stringify(perm) !== JSON.stringify(original)) {
        updates.push({
          menuLinkId: id,
          read: perm.get,
          create: perm.create,
          update: perm.update,
          delete: perm.delete,
        });
      }
    }

    if (updates.length === 0) return;

    const success = await bulkUpdateMenuAccess(selectedRoleId, updates);
    if (success) {
      const data = await fetchRoleSpecificAccess(selectedRoleId);
      setMenuAccessData(data);

      const initial: Record<string, Permission> = {};
      const processItem = (item: TransformedMenuAccessType) => {
        if (item.id) {
          initial[item.id] = {
            get: item.permissions?.read || false,
            create: item.permissions?.create || false,
            update: item.permissions?.update || false,
            delete: item.permissions?.delete || false,
          };
        }
        item.children?.forEach(processItem);
      };
      data.forEach(processItem);
      setPermissions(initial);
      setOriginalPermissions(JSON.parse(JSON.stringify(initial)));
    }
  }, [permissions, originalPermissions, selectedRoleId]);

  useImperativeHandle(
    ref,
    () => ({
      save: handleSave,
      reset: handleReset,
      hasChanges,
    }),
    [handleSave, handleReset, hasChanges],
  );

  return {
    menuAccessData: localizedMenuAccessData,
    permissions,
    hasChanges,
    isLoading: menuAccessIsLoadingSignal.value,
    selectedRoleName,
    canUpdate,
    handlePermissionChange,
    permissionCheckboxProps,
    iconProps,
    handleReset,
    handleSave,
  };
}
