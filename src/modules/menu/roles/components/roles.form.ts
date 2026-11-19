'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import { useForm } from 'react-hook-form';
import { useSignals } from '@preact/signals-react/runtime';
import {
  createMenuRole,
  menuRoleSaveIsLoadingSignal,
  roleSelectedId,
  editModeUpdate,
  personaSignal,
} from '../hooks/service';
import { menuRolesSignal } from '../hooks/service-load';
import { getDefaultRole, roleInitValues } from '../hooks/data';
import { roleValidation } from '../hooks/validation';
import type { MenuRole, MenuRoleFormData } from '../hooks/types';
import {
  fetchRoleSpecificAccess,
  bulkUpdateMenuAccess,
} from '../../menu-access/hooks/service-http';
import type { TransformedMenuAccessType } from '../../menu-access/hooks/types';
import { loadRolesCall } from '../hooks/service-load.ts';

export function useRolesForm() {
  useSignals();
  const { t } = useTranslation();
  const selectedId = roleSelectedId.value;
  const isEdit = Boolean(selectedId);
  const roles = menuRolesSignal.value;

  const currentRole = useMemo(() => {
    if (!selectedId) return getDefaultRole();
    return roles.find((r) => r.id === selectedId) || getDefaultRole();
  }, [selectedId, roles]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuRoleFormData>({
    defaultValues: {
      name: currentRole.name || '',
      persona: currentRole.persona || personaSignal.value,
      active: currentRole.active !== false,
      cloneFrom: '',
    },
  });

  useEffect(() => {
    reset({
      name: currentRole.name || '',
      persona: currentRole.persona || personaSignal.value,
      active: currentRole.active !== false,
      cloneFrom: '',
    });
  }, [currentRole, reset]);

  const onCancel = useCallback(() => {
    editModeUpdate(undefined);
  }, []);

  const onSubmit = useCallback(
    async (formData: MenuRoleFormData) => {
      const payload = {
        ...(isEdit && selectedId ? { id: selectedId } : {}),
        name: formData.name,
        persona: formData.persona,
        active: formData.active,
      };

      const saveResult = await createMenuRole(payload);
      const newRoleId = saveResult.roleId;

      if (saveResult.success && newRoleId && !isEdit && formData.cloneFrom) {
        try {
          const sourcePermissions = await fetchRoleSpecificAccess(formData.cloneFrom);
          const permissionUpdates: {
            menuLinkId: string;
            read: boolean;
            create: boolean;
            update: boolean;
            delete: boolean;
          }[] = [];

          const processItem = (item: TransformedMenuAccessType) => {
            if (item.id && item.permissions) {
              permissionUpdates.push({
                menuLinkId: item.id,
                read: item.permissions.read || false,
                create: item.permissions.create || false,
                update: item.permissions.update || false,
                delete: item.permissions.delete || false,
              });
            }
            if (item.children) {
              item.children.forEach(processItem);
            }
          };

          sourcePermissions.forEach(processItem);

          if (permissionUpdates.length > 0) {
            await bulkUpdateMenuAccess(newRoleId, permissionUpdates);
          }
        } catch (error) {
          console.error('Error cloning permissions:', error);
        }
      }

      if (saveResult.success) {
        await loadRolesCall();
        editModeUpdate(undefined);
      }
    },
    [isEdit, selectedId],
  );

  const isLoading = menuRoleSaveIsLoadingSignal.value;

  const cloneOptions = useMemo(() => {
    return [
      { key: '', label: t('selectNone') },
      ...roles.map((r: MenuRole) => ({
        key: r.id,
        label: r.name,
      })),
    ];
  }, [roles, t]);

  const nameProps = useMemo(
    () => ({
      control,
      name: 'name' as const,
      label: t('roleName'),
      placeholder: t('roleNamePlaceholder'),
      rules: roleValidation.name,
      error: errors.name,
      className: 'w-full mb-3',
    }),
    [control, errors.name, t],
  );

  const cloneProps = useMemo(
    () => ({
      control,
      name: 'cloneFrom' as const,
      label: t('clonePermissionsFrom'),
      options: cloneOptions,
      className: 'w-full mb-3',
    }),
    [control, cloneOptions, t],
  );

  const activeProps = useMemo(
    () => ({
      control,
      name: 'active' as const,
      label: t('activeStatus'),
      className: 'w-full mb-3',
    }),
    [control, t],
  );

  const submitButtonProps = useMemo(
    () => ({
      name: 'Save' as const,
      type: 'submit' as const,
      action: 'primary' as const,
      label: isEdit ? t('saveChanges') : t('createRole'),
      loading: isLoading,
      disabled: isLoading,
    }),
    [isEdit, isLoading, t],
  );

  const cancelProps = useMemo(
    () => ({
      action: 'secondary' as const,
      label: t('cancel'),
      name: 'CircleX' as const,
      onPress: onCancel,
      disabled: isLoading,
    }),
    [onCancel, isLoading, t],
  );

  return {
    isEdit,
    handleSubmit: handleSubmit(onSubmit),
    nameProps,
    cloneProps,
    activeProps,
    submitButtonProps,
    cancelProps,
    defaultValues: roleInitValues,
  };
}
