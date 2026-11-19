'use client';

import {
  isAdminRootMenu,
  AuthUserSignal,
  refreshMenuNavigation,
} from '../../hooks/menu-context.ts';
import { ShowToast } from 'shared-lib-web';
import { useSignals } from '@preact/signals-react/runtime';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import {
  createMenuGroup,
  createMenuLink,
  fetchMenuGroupsWithLinks,
  menuGroupsWithLinksSignal,
  menuGroupTranslateIsLoading,
  menuLinkSaveIsLoadingSignal,
  personaSignal,
  translateMenuGroupNames,
  updateMenuGroup,
  updateMenuLink,
} from '../hooks/service-http';
import {
  menuGroupOptionsSignal
} from '../hooks/service-load';
import type { MenuDrawerMode, MenuGroupItem, MenuGroupWithLinksItem, MenuLinkFormData, MenuLinkItem } from '../hooks/types';
import { MenuLinkValidation } from '../hooks/validation';

/**
 * Languages offered in the menu name editor (groups and links). The first entry is
 * the base/source language; the translate button fills French and Spanish from
 * it. These codes are the keys stored in `nameLang`.
 */
export const MENU_NAME_LOCALES = [
  { code: 'en-US', label: 'English' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'es-ES', label: 'Español' },
] as const;

const BASE_LOCALE = 'en-US';
const MENU_NAME_LOCALE_CODES: string[] = MENU_NAME_LOCALES.map((l) => l.code);

export type { MenuDrawerMode };

export interface MenuLinkFormProps {
  isOpen: boolean;
  mode: MenuDrawerMode;
  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  parentId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Builds the name and nameLang to save for a group or link.
 *
 * The base (en-US) entry is the canonical name. Languages the user left empty are
 * filled by translating the base name, so every language is saved. Languages the
 * user typed are kept as-is. Locales outside the editor's set (saved earlier) are
 * preserved.
 */
const resolveMenuName = async (
  typed: Record<string, string> | undefined,
  fallbackName: string,
  savedNameLang: Record<string, string> | undefined,
) => {
  const name = (typed?.[BASE_LOCALE] ?? fallbackName ?? '').trim();

  const nameLang: Record<string, string> = {};
  for (const [code, value] of Object.entries(savedNameLang ?? {})) {
    if (!MENU_NAME_LOCALE_CODES.includes(code) && value) nameLang[code] = value;
  }
  nameLang[BASE_LOCALE] = name;
  for (const code of MENU_NAME_LOCALE_CODES) {
    if (code === BASE_LOCALE) continue;
    const value = (typed?.[code] ?? '').trim();
    if (value) nameLang[code] = value;
  }

  if (name) {
    const missing = MENU_NAME_LOCALE_CODES.filter((code) => code !== BASE_LOCALE && !nameLang[code]);
    if (missing.length > 0) {
      const translated = await translateMenuGroupNames(name, BASE_LOCALE, missing);
      Object.assign(nameLang, translated);
    }
  }

  return { name, nameLang };
};

/**
 * Number of parent rows the menu management list shows: one ROOT row when a ROOT
 * group exists, one row per normal group, and one row per ADMIN_ROOT link.
 */
const countTopLevelMenus = (groups: MenuGroupWithLinksItem[]): number => {
  let count = groups.some((group) => !group.id || group.id === 'ROOT') ? 1 : 0;
  for (const group of groups) {
    if (!group.id || group.id === 'ROOT') continue;
    count += isAdminRootMenu(group.id) ? (group.links?.length ?? 0) : 1;
  }
  return count;
};

/** Number of links under the parent group the form was opened from. */
const countSubMenus = (groups: MenuGroupWithLinksItem[], parentId: string): number => {
  const key = !parentId || parentId === 'ROOT_GROUP' ? 'ROOT' : parentId;
  return groups.reduce(
    (sum, group) => ((group.id || 'ROOT') === key ? sum + (group.links?.length ?? 0) : sum),
    0,
  );
};

// Icon-name formatting is disabled for now — the lucide icon name is saved exactly
// as the user types it. Keep this helper for when formatting is re-enabled.
// const toKebabCaseCapitalized = (value: string): string => {
//   return value
//     .trim()
//     .replace(/([a-z])([A-Z])/g, '$1-$2')
//     .split(/[\s_-]+/)
//     .filter(Boolean)
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//     .join('-');
// };

export function useMenuLinkForm({ isOpen, mode, data, parentId, onClose, onSuccess }: MenuLinkFormProps) {
  useSignals();
  const { t } = useTranslation();

  const menuGroupOptions = menuGroupOptionsSignal.value;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MenuLinkFormData>({
    defaultValues: {
      name: '',
      nameLang: { 'en-US': '', 'fr-FR': '', 'es-ES': '' },
      icon: '',
      href: '',
      priority: 0,
      active: true,
      menuGroupId: '',
      persona: personaSignal.value,
    },
  });

  const isGroupMode = mode === 'create-group' || mode === 'edit-group';
  const isCreateMode = mode === 'create-group' || mode === 'create-link';

  useEffect(() => {
    if (isOpen) {
      if (data) {
        const baseName = data.nameLang?.['en-US'] || data.name || '';
        setValue('name', baseName);
        setValue('icon', data.icon || '');
        setValue('priority', data.priority || 0);
        setValue('active', data.active !== false);

        // Seed every language from the saved nameLang so the inputs show the
        // stored translations for both groups and links.
        setValue('nameLang', {
          'en-US': baseName,
          'fr-FR': data.nameLang?.['fr-FR'] || '',
          'es-ES': data.nameLang?.['es-ES'] || '',
        });

        if (!isGroupMode) {
          setValue('href', data.path || data.href || '');
          setValue('menuGroupId', data.menuGroupId || (parentId === 'ROOT_GROUP' ? 'ROOT' : parentId) || 'ROOT');
        }
      } else {
        // New item goes last: priority = existing menus (group form) or existing
        // submenus under the parent (link form), plus one. Read at open time so a
        // background refresh does not overwrite what the user has typed.
        const groups = menuGroupsWithLinksSignal.peek();
        const existingCount =
          mode === 'create-group' ? countTopLevelMenus(groups) : countSubMenus(groups, parentId);

        reset({
          name: '',
          nameLang: { 'en-US': '', 'fr-FR': '', 'es-ES': '' },
          icon: '',
          href: '',
          priority: existingCount + 1,
          active: true,
          menuGroupId: (parentId === 'ROOT_GROUP' ? 'ROOT' : parentId) || 'ROOT',
          persona: personaSignal.value,
        });
      }
    }
  }, [isOpen, data, mode, parentId, isGroupMode, setValue, reset]);

  const drawerTitle = useMemo(() => {
    switch (mode) {
      case 'create-group':
        return t('settings.menu');
      case 'edit-group':
        return t('settings.menu');
      case 'create-link':
        return t('settings.menu');
      case 'edit-link':
        return t('settings.menu');
    }
  }, [mode, t]);

  const onSubmit = useCallback(
    async (formData: MenuLinkFormData) => {
      let success = false;

      const priority = Number.isFinite(Number(formData.priority)) ? Math.trunc(Number(formData.priority)) : 0;
      const active = formData.active ?? true;

      // Auto-translate runs here for groups and links, on create and on edit.
      const { name, nameLang } = await resolveMenuName(formData.nameLang, formData.name, data?.nameLang);

      if (isGroupMode) {
        const payload: Partial<MenuGroupItem> = {
          ...(data?.id && !isCreateMode ? { id: String(data.id) } : {}),
          name,
          nameLang,
          icon: formData.icon?.trim() || '',
          priority,
          active,
          persona: formData.persona || personaSignal.value,
        };

        if (isCreateMode) {
          success = await createMenuGroup(payload);
        } else {
          success = await updateMenuGroup(payload);
        }
      } else {
        const resolvedMenuGroupId =
          formData.menuGroupId === 'ROOT_GROUP' || parentId === 'ROOT_GROUP'
            ? 'ROOT'
            : formData.menuGroupId?.trim() || parentId?.trim() || 'ROOT';
        const payload: Partial<MenuLinkItem> = {
          ...(data?.id && !isCreateMode ? { id: String(data.id) } : {}),
          name,
          nameLang,
          href: formData.href?.trim() || '',
          // Save the lucide icon name as entered (formatting disabled for now).
          icon: formData.icon?.trim() || '',
          // icon: toKebabCaseCapitalized(formData.icon?.trim() || ''),
          priority,
          active,
          menuGroupId: resolvedMenuGroupId === 'ROOT' ? 'ROOT' : resolvedMenuGroupId,
          persona: formData.persona || personaSignal.value,
        };

        if (isCreateMode) {
          success = await createMenuLink(payload);
        } else {
          success = await updateMenuLink(payload);
        }
      }

      if (success) {
        await fetchMenuGroupsWithLinks();
        // Menu Management edits change the same menu tree the sidebar renders
        // (group/link name, icon, href, priority, active, parent). Refresh the
        // sidebar's authorization menus so the change shows up immediately,
        // without requiring a reload. Best-effort: the save already succeeded.
        try {
          await refreshMenuNavigation(AuthUserSignal.value?.roles ?? undefined);
        } catch {
          ShowToast('Menu saved, but navigation could not be refreshed.', 'warning');
        }
        onSuccess?.();
        onClose();
      }
    },
    [isGroupMode, isCreateMode, data, parentId, onSuccess, onClose]
  );

  // Save button shows loading while the auto-translate runs as well as the save.
  const isLoading = menuLinkSaveIsLoadingSignal.value || menuGroupTranslateIsLoading.value;

  // Multi-language name editor for groups and links. Binds to `nameLang.{code}`;
  // the English (en-US) entry is the canonical name saved on submit.
  const nameLangProps = useMemo(
    () => ({
      control,
      name: 'nameLang' as const,
      label: isGroupMode ? t('groupName') : t('menuName'),
      locales: [...MENU_NAME_LOCALES],
      // Short, fixed 3-language set — grow to fit instead of a fixed-height scroll area.
      scroll: false,
      rules: MenuLinkValidation.name,
      error: (errors.nameLang as Record<string, FieldError | undefined> | undefined)?.[BASE_LOCALE],
      className: 'w-full mb-3',
    }),
    [control, errors.nameLang, isGroupMode, t]
  );

  const iconProps = useMemo(
    () => ({
      control,
      name: 'icon' as const,
      label: t('lucideIconName'),
      placeholder: isGroupMode ? t('iconGroupPlaceholder') : t('iconLinkPlaceholder'),
      rules: MenuLinkValidation.icon,
      error: errors.icon,
      className: 'w-full mb-3',
      // Icon formatting disabled for now — let the field keep the raw typed value
      // so the lucide name is saved exactly as entered.
      // onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      //   if (!isGroupMode) {
      //     setValue('icon', toKebabCaseCapitalized(e.target.value), { shouldValidate: true });
      //   }
      // },
    }),
    // `setValue` dropped while the onChange formatter above is disabled; re-add it when restored.
    [control, isGroupMode, errors.icon, t]
  );

  const hrefProps = useMemo(
    () => ({
      control,
      name: 'href' as const,
      label: t('pathUrl'),
      placeholder: t('pathUrlPlaceholder'),
      rules: MenuLinkValidation.href,
      error: errors.href,
      className: 'w-full mb-3',
      disabled: !isCreateMode,
    }),
    [control, errors.href, isCreateMode, t]
  );

  const menuGroupIdProps = useMemo(
    () => ({
      control,
      name: 'menuGroupId' as const,
      label: t('parentMenuGroup'),
      options: menuGroupOptions,
      rules: MenuLinkValidation.menuGroupId,
      error: errors.menuGroupId,
      className: 'w-full mb-3',
    }),
    [control, menuGroupOptions, errors.menuGroupId, t]
  );

  const priorityProps = useMemo(
    () => ({
      control,
      name: 'priority' as const,
      label: t('sortPriorityOrder'),
      type: 'number',
      placeholder: '0',
      required: true,
      rules: MenuLinkValidation.priority,
      error: errors.priority,
      className: 'w-full mb-3',
    }),
    [control, errors.priority, t]
  );

  const activeProps = useMemo(
    () => ({
      control,
      name: 'active' as const,
      label: t('activeStatus'),
      className: 'w-full mb-3',
    }),
    [control, t]
  );

  const submitButtonProps = useMemo(
    () => ({
      label: isCreateMode ? t('create') : t('saveChanges'),
      name: 'Save' as const,
      type: 'submit' as const,
      action: 'primary' as const,
      loading: isLoading,
      disabled: isLoading,
    }),
    [isCreateMode, isLoading, t]
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
    [onClose]
  );

  return {
    isOpen,
    drawerTitle,
    isGroupMode,
    handleSubmit: handleSubmit(onSubmit),
    nameLangProps,
    iconProps,
    hrefProps,
    menuGroupIdProps,
    priorityProps,
    activeProps,
    submitButtonProps,
    closeButtonProps,
    onClose,
  };
}
