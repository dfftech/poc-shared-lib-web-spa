'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { localeSignal } from 'shared-lib-web';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import { useForm } from 'react-hook-form';
import { useSignals } from '@preact/signals-react/runtime';
import {
  createMenuRole,
  menuRoleSaveIsLoadingSignal,
  personaSignal,
} from '../hooks/service';
import { menuRolesSignal } from '../hooks/service-load';
import { loadRolesCall } from '../hooks/service-load.ts';
import { roleValidation } from '../hooks/validation';
import type { MenuRole, MenuRoleFormData } from '../hooks/types';
import { fetchRoleSpecificAccess, bulkUpdateMenuAccess } from '../../menu-access/hooks/service-http';
import type { TransformedMenuAccessType } from '../../menu-access/hooks/types';

export interface RoleAddInlineProps {
  isOpen: boolean;
  onClose: () => void;
  roleId?: string;
  roleName?: string;
  onCreated?: (roleId: string) => void;
}

export function useRoleAddInline({ isOpen, onClose, roleId, roleName, onCreated }: RoleAddInlineProps) {
  useSignals();
  const { t } = useTranslation();
  const roles = menuRolesSignal.value;
  const currentRole = roles.find((role: MenuRole) => role.id === roleId);
  const isEdit = Boolean(roleId);
  const isLoading = menuRoleSaveIsLoadingSignal.value;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuRoleFormData>({
    defaultValues: {
      name: '',
      persona: personaSignal.value,
      active: true,
      cloneFrom: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name:
          roleName ||
          currentRole?.name ||
          currentRole?.nameLang?.[localeSignal.value] ||
          currentRole?.nameLang?.['en-US'] ||
          '',
        persona: currentRole?.persona || personaSignal.value,
        active: currentRole?.active !== false,
        cloneFrom: '',
      });
    }
  }, [currentRole, isOpen, reset, roleName]);

  const onSubmit = useCallback(
    async (formData: MenuRoleFormData) => {
      const saveResult = await createMenuRole({
        ...(isEdit && roleId ? { id: roleId } : {}),
        name: formData.name,
        persona: formData.persona,
        active: formData.active,
        ...(isEdit
          ? {
              nameLang: {
                ...(currentRole?.nameLang ?? {}),
                'en-US': formData.name,
              },
            }
          : {}),
      });
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
        if (!isEdit && newRoleId) onCreated?.(newRoleId);
        onClose();
      }
    },
    [currentRole, isEdit, onCreated, onClose, roleId],
  );

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

  const closeButtonProps = useMemo(
    () => ({
      name: 'X' as const,
      label: t('close'),
      type: 'button' as const,
      action: 'ghost' as const,
      className: 'btn-sm btn-circle',
      onPress: onClose,
    }),
    [onClose],
  );

  return {
    isOpen,
    isEdit,
    handleSubmit: handleSubmit(onSubmit),
    nameProps,
    cloneProps,
    activeProps,
    submitButtonProps,
    closeButtonProps,
    onClose,
  };
}
