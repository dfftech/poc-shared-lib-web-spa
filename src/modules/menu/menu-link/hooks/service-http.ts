import { AppHttp, ShowToast } from 'shared-lib-web';
import { signal } from '@preact/signals-react';
import { CallLangText, ConstKeys } from 'dff-util';
import { MsUrl } from '../../../../config.ts';
import { personaSignal } from '../../hooks/menu-context.ts';
import { hasApiError, hasApiRows, isApiRecord, readApiRows } from '../../hooks/api-response.ts';
import type { MenuGroupItem, MenuGroupWithLinksItem, MenuLinkItem } from './types';
export { personaSignal };

// ─── Signals ─────────────────────────────────────────────────────────────────
export const menuLinksSignal = signal<MenuLinkItem[]>([]);
export const menuLinksIsLoadingSignal = signal<boolean>(false);
export const menuGroupsSignal = signal<MenuGroupItem[]>([]);
export const menuGroupsIsLoadingSignal = signal<boolean>(false);
export const menuGroupsWithLinksSignal = signal<MenuGroupWithLinksItem[]>([]);
export const menuGroupsWithLinksIsLoadingSignal = signal<boolean>(false);

// ─── Persona Constant API ─────────────────────────────────────────────────────
// Fetches GET {{MsUrl.utils}}/app-constant-entity/persona_admin
// and persists response.data.code into personaSignal for use across the menu module.
export const fetchAppConstantPersonaAdmin = async (): Promise<void> => {
  try {
    const resp = await AppHttp.Get(`${MsUrl.utils}/app-constant-entity/persona_admin`, {});
    const data = isApiRecord(resp) && isApiRecord(resp.data) ? resp.data : undefined;
    if (typeof data?.code === 'string' && data.code) {
      personaSignal.value = data.code;
    }
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
  }
};
export const menuLinkSaveIsLoadingSignal = signal<boolean>(false);

// ─── HTTP API Calls ──────────────────────────────────────────────────────────

let menuGroupsWithLinksPromise: Promise<MenuGroupWithLinksItem[]> | null = null;

export const fetchMenuGroupsWithLinks = async (): Promise<MenuGroupWithLinksItem[]> => {
  if (menuGroupsWithLinksPromise) {
    return menuGroupsWithLinksPromise;
  }

  menuGroupsWithLinksPromise = (async () => {
    try {
      menuGroupsWithLinksIsLoadingSignal.value = true;
      menuGroupsIsLoadingSignal.value = true;
      const url = `${MsUrl.utils}/menu-group-search`;
      const params = {
        active: true,
        persona: personaSignal.value,
        page: 1,
        limit: 100,
        orderBy: 'priority',
        order: 'ASC',
      };

      const resp = await AppHttp.Post(url, params);

      if (hasApiError(resp)) {
        throw { error: { message: 'Failed to fetch menu groups with links' } };
      }
      if (!hasApiRows(resp)) {
        throw new Error('The menu group response was not a list.');
      }

      const groups = readApiRows(resp)
        .filter(isMenuGroupWithLinksItem)
        .map((group) => ({
          ...group,
          links: group.links.map((link) => ({
            ...link,
            menuGroupId: link.menuGroupId || group.id,
          })),
        }));

      menuGroupsWithLinksSignal.value = groups;

      const allLinks: MenuLinkItem[] = [];
      const allGroups: MenuGroupItem[] = [];

      groups.forEach((group) => {
        allGroups.push({
          id: group.id,
          name: group.name,
          nameLang: group.nameLang,
          icon: group.icon,
          active: group.active,
          priority: group.priority,
          persona: group.persona || personaSignal.value,
        });

        if (group.links && Array.isArray(group.links)) {
          group.links.forEach((link) => {
            allLinks.push({
              ...link,
              menuGroupId: link.menuGroupId || group.id,
            });
          });
        }
      });

      menuLinksSignal.value = allLinks;
      menuGroupsSignal.value = allGroups;

      return groups;
    } catch (error: unknown) {
      const err = error as { message?: string; error?: { message?: string } };
      const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
      ShowToast(message, 'error');
      return [];
    } finally {
      menuGroupsWithLinksIsLoadingSignal.value = false;
      menuGroupsIsLoadingSignal.value = false;
      menuGroupsWithLinksPromise = null;
    }
  })();

  return menuGroupsWithLinksPromise;
};

export const fetchMenuGroups = async (): Promise<MenuGroupItem[]> => {
  await fetchMenuGroupsWithLinks();
  return menuGroupsSignal.value;
};

export const createMenuGroup = async (data: Partial<MenuGroupItem>): Promise<boolean> => {
  try {
    menuLinkSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-group-save`;
    const payload = {
      ...data,
      persona: personaSignal.value,
      nameLang: data.nameLang || (data.name ? { 'en-US': data.name } : undefined),
    };
    const resp = await AppHttp.Post(url, payload);
    if (hasApiError(resp)) throw { error: { message: 'Failed to create menu group' } };
    ShowToast('Menu group created successfully', 'success');
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuLinkSaveIsLoadingSignal.value = false;
  }
};

export const updateMenuGroup = async (data: Partial<MenuGroupItem>): Promise<boolean> => {
  try {
    menuLinkSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-group-save`;
    const payload = {
      ...data,
      persona: personaSignal.value,
      nameLang: data.nameLang || (data.name ? { 'en-US': data.name } : undefined),
    };
    const resp = await AppHttp.Post(url, payload);
    if (hasApiError(resp)) throw { error: { message: 'Failed to update menu group' } };
    ShowToast('Menu group updated successfully', 'success');
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuLinkSaveIsLoadingSignal.value = false;
  }
};

export const deleteMenuGroup = async (id: string): Promise<boolean> => {
  try {
    menuLinkSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-group-delete`;
    const response = await AppHttp.Post(url, { id });
    if (hasApiError(response)) throw new Error('Failed to delete menu group.');
    ShowToast('Menu group deleted successfully', 'success');
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuLinkSaveIsLoadingSignal.value = false;
  }
};

export const createMenuLink = async (data: Partial<MenuLinkItem>): Promise<boolean> => {
  try {
    menuLinkSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-link-save`;
    const payload = {
      ...data,
      persona: personaSignal.value,
      nameLang: data.nameLang || (data.name ? { 'en-US': data.name } : undefined),
    };
    const resp = await AppHttp.Post(url, payload);
    if (hasApiError(resp)) throw { error: { message: 'Failed to create menu link' } };
    ShowToast('Menu link created successfully', 'success');
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuLinkSaveIsLoadingSignal.value = false;
  }
};

export const updateMenuLink = async (data: Partial<MenuLinkItem>): Promise<boolean> => {
  try {
    menuLinkSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-link-save`;
    const payload = {
      ...data,
      persona: personaSignal.value,
      nameLang: data.nameLang || (data.name ? { 'en-US': data.name } : undefined),
    };
    const resp = await AppHttp.Post(url, payload);
    if (hasApiError(resp)) throw { error: { message: 'Failed to update menu link' } };
    ShowToast('Menu link updated successfully', 'success');
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuLinkSaveIsLoadingSignal.value = false;
  }
};

export const deleteMenuLink = async (id: string): Promise<boolean> => {
  try {
    menuLinkSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-link-delete`;
    const response = await AppHttp.Post(url, { id });
    if (hasApiError(response)) throw new Error('Failed to delete menu link.');
    ShowToast('Menu link deleted successfully', 'success');
    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuLinkSaveIsLoadingSignal.value = false;
  }
};

export const fetchMenuLinks = async (): Promise<MenuLinkItem[]> => {
  try {
    menuLinksIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-link-search`;
    const params = {
      searchTerm: '',
      active: true,
      persona: personaSignal.value,
      orderBy: 'priority',
      order: 'ASC',
      page: 1,
      limit: 100,
    };

    const resp = await AppHttp.Post(url, params);

    if (hasApiError(resp)) {
      throw { error: { message: 'Failed to fetch menu links' } };
    }
    if (!hasApiRows(resp)) {
      throw new Error('The menu link response was not a list.');
    }

    const links = readApiRows(resp).filter(isMenuLinkItem);

    menuLinksSignal.value = links;
    return links;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return [];
  } finally {
    menuLinksIsLoadingSignal.value = false;
  }
};

// ─── Auto-translate (menu group name) ────────────────────────────────────────
export const menuGroupTranslateIsLoading = signal<boolean>(false);

/**
 * Translates a base-language menu group name into each target locale. Locales the
 * translator cannot resolve are left out, so the sidebar falls back to en-US for them.
 * Uses the shared language translator from `dff-util`, as the TypeLang fields do.
 */
export const translateMenuGroupNames = async (
  baseName: string,
  baseLocale: string,
  targetLocales: readonly string[],
): Promise<Record<string, string>> => {
  const text = baseName.trim();
  if (!text || targetLocales.length === 0) return {};
  menuGroupTranslateIsLoading.value = true;
  try {
    const results = await Promise.all(
      targetLocales.map(async (locale) => [
        locale,
        await CallLangText(text, baseLocale, locale),
      ] as const),
    );
    return Object.fromEntries(results.filter(([, value]) => value.trim().length > 0));
  } finally {
    menuGroupTranslateIsLoading.value = false;
  }
};

function isMenuGroupWithLinksItem(value: unknown): value is MenuGroupWithLinksItem {
  return (
    isApiRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.active === 'boolean' &&
    Array.isArray(value.links) &&
    value.links.every(isMenuLinkItem)
  );
}

function isMenuLinkItem(value: unknown): value is MenuLinkItem {
  return (
    isApiRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.href === 'string' &&
    typeof value.active === 'boolean' &&
    (value.menuGroupId === undefined || typeof value.menuGroupId === 'string')
  );
}
