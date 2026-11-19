import { localeSignal } from "shared-lib-web";
import { useSignals } from "@preact/signals-react/runtime";
import type { ForwardedRef } from "react";
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

  const handlePermissionChange = useCallback(
    (featureId: string, permissionType: keyof Permission) => {
      setPermissions((prev) => {
        const current = prev[featureId] || {
          get: false,
          create: false,
          update: false,
          delete: false,
        };
        const nextValue = !current[permissionType];

        // When read (get) is unchecked, uncheck all other accesses (create, update/write, delete)
        if (permissionType === "get" && !nextValue) {
          return {
            ...prev,
            [featureId]: {
              get: false,
              create: false,
              update: false,
              delete: false,
            },
          };
        }

        // When any create / write (update) / delete is checked, ensure read (get) is also checked
        if (permissionType !== "get" && nextValue) {
          return {
            ...prev,
            [featureId]: {
              ...current,
              get: true,
              [permissionType]: true,
            },
          };
        }

        return {
          ...prev,
          [featureId]: {
            ...current,
            [permissionType]: nextValue,
          },
        };
      });
    },
    [],
  );

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
    handleReset,
    handleSave,
  };
}
