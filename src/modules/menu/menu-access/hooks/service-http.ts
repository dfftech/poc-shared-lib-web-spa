import type { IconName } from 'shared-lib-web';
import { AppHttp, ShowToast } from 'shared-lib-web';
import { signal } from '@preact/signals-react';
import { ConstKeys } from 'dff-util';
import { MsUrl } from '../../../../config.ts';
import {
  AuthUserSignal,
  isAdminRootMenu,
  personaSignal,
  refreshMenuNavigation,
} from '../../hooks/menu-context.ts';
import { hasApiError, hasApiRows, isApiRecord, readApiRows } from '../../hooks/api-response.ts';
import type { MenuAccessItem, TransformedMenuAccessType } from './types';
export { personaSignal };

// ─── Signals ─────────────────────────────────────────────────────────────────
export const menuAccessDataSignal = signal<TransformedMenuAccessType[] | undefined>(undefined);
export const menuAccessIsLoadingSignal = signal<boolean>(false);
export const menuRoleCreateIsLoadingSignal = signal<boolean>(false);
export const menuAccessSaveIsLoadingSignal = signal<boolean>(false);

export const transformMenuAccessData = (data: MenuAccessItem[], includeAll = false): TransformedMenuAccessType[] => {
  const groupMap = new Map<string, { group: MenuAccessItem['menuLink']['menuGroup']; items: MenuAccessItem[] }>();
  const rootItems: MenuAccessItem[] = [];

  data.forEach((item) => {
    if (!item?.menuLink?.active || (!includeAll && !item.read)) {
      return;
    }

    const groupId = item.menuLink.menuGroupId;
    const group = item.menuLink.menuGroup;

    // Links under ADMIN_ROOT are promoted to top-level (parent) rows.
    if (!groupId || groupId === 'ROOT' || isAdminRootMenu(groupId) || !group) {
      rootItems.push(item);
    } else {
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, { group, items: [] });
      }
      groupMap.get(groupId)!.items.push(item);
    }
  });

  const result: TransformedMenuAccessType[] = [];

  rootItems
    .sort((a, b) => (a.menuLink?.priority || 0) - (b.menuLink?.priority || 0))
    .forEach((item) => {
      result.push({
        id: item?.menuLink?.id,
        menuId: item.menuLink?.id,
        name: item?.menuLink?.nameLang?.['en-US'] || item?.menuLink?.name || '',
        nameLang: item?.menuLink?.nameLang,
        href: item?.menuLink?.href,
        icon: (item?.menuLink?.icon as IconName) || '',
        permissions: {
          read: item.read,
          create: item.create,
          update: item.update,
          delete: item.delete,
        },
        priority: item.menuLink?.priority,
        active: item.menuLink?.active,
      });
    });

  groupMap.forEach(({ group, items }) => {
    if (!group) return;

    const children = items
      .sort((a, b) => (a.menuLink?.priority || 0) - (b.menuLink?.priority || 0))
      .map((item) => ({
        id: item.menuLink?.id,
        menuId: item.menuLink?.id,
        name: item.menuLink?.nameLang?.['en-US'] || item.menuLink?.name || '',
        nameLang: item.menuLink?.nameLang,
        href: item.menuLink?.href,
        icon: (item.menuLink?.icon as IconName) || '',
        permissions: {
          read: item.read,
          create: item.create,
          update: item.update,
          delete: item.delete,
        },
        priority: item.menuLink?.priority,
        active: item.menuLink?.active,
      }));

    result.push({
      id: group.id,
      name: group.nameLang?.['en-US'] || group.name || '',
      nameLang: group.nameLang,
      icon: group.icon ? (group.icon as IconName) : undefined,
      children,
      priority: group.priority,
      active: group.active,
    });
  });

  result.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  return result;
};

// ─── HTTP API Calls ──────────────────────────────────────────────────────────

export const createMenuRole = async (data: {
  id?: string;
  name: string;
  persona: string;
  active: boolean;
  nameLang?: Record<string, string>;
}): Promise<string | null> => {
  try {
    menuRoleCreateIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-role-save`;
    const payload = {
      ...data,
      persona: personaSignal.value,
      nameLang: data.nameLang || { 'en-US': data.name },
    };

    const resp = await AppHttp.Post(url, payload);

    if (hasApiError(resp)) {
      throw { error: { message: 'Failed to save menu role' } };
    }

    const responseRecord = isApiRecord(resp) ? resp : {};
    const dataRecord = isApiRecord(responseRecord.data) ? responseRecord.data : {};
    const roleId =
      (typeof dataRecord.id === 'string' && dataRecord.id) ||
      (typeof responseRecord.id === 'string' && responseRecord.id) ||
      null;
    ShowToast('Menu role saved successfully', 'success');
    return roleId;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return null;
  } finally {
    menuRoleCreateIsLoadingSignal.value = false;
  }
};

export const fetchMenuAccess = async (menuRoleIds: string[]): Promise<TransformedMenuAccessType[]> => {
  try {
    menuAccessIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-access-search`;
    const params = { menuRoleId: menuRoleIds, active: true, persona: personaSignal.value };

    const resp = await AppHttp.Post(url, params);
    if (hasApiError(resp)) {
      throw { error: { message: 'Failed to fetch menu access' } };
    }
    if (!hasApiRows(resp)) {
      throw new Error('The menu access response was not a list.');
    }

    const menuItems = readApiRows(resp).filter(isMenuAccessItem);

    if (menuItems.length === 0) {
      menuAccessDataSignal.value = [];
      return [];
    }

    const transformedData = transformMenuAccessData(menuItems);
    menuAccessDataSignal.value = transformedData;
    return transformedData;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    throw error;
  } finally {
    menuAccessIsLoadingSignal.value = false;
  }
};

export const fetchRoleSpecificAccess = async (menuRoleId: string): Promise<TransformedMenuAccessType[]> => {
  try {
    menuAccessIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-access-search`;
    const params = { menuRoleId: [menuRoleId], active: true, persona: personaSignal.value };

    const resp = await AppHttp.Post(url, params);

    if (hasApiError(resp)) {
      throw new Error('Failed to fetch role-specific menu access.');
    }
    if (!hasApiRows(resp)) {
      throw new Error('The role-specific menu access response was not a list.');
    }

    const menuItems = readApiRows(resp).filter(isMenuAccessItem);

    if (!menuItems || menuItems.length === 0) {
      return [];
    }

    return transformMenuAccessData(menuItems, true);
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    ShowToast(err?.message || err?.error?.message || ConstKeys.WENT_WRONG, 'error');
    return [];
  } finally {
    menuAccessIsLoadingSignal.value = false;
  }
};

export const bulkUpdateMenuAccess = async (
  menuRoleId: string,
  updates: {
    menuLinkId: string;
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  }[]
): Promise<boolean> => {
  try {
    menuAccessSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-access-bulk-create`;
    const payload = { menuRoleId, menuLinks: updates, persona: personaSignal.value };

    const resp = await AppHttp.Post(url, payload);

    if (hasApiError(resp)) {
      throw { error: { message: 'Failed to update menu access' } };
    }

    ShowToast('Menu access updated successfully', 'success');

    // Refresh left sidebar so saved permissions apply immediately.
    // Best-effort: re-run /menu-access-search for the current session roles
    // then rebuild the sidebar authorization menus from the fresh response.
    const sessionRoles = AuthUserSignal.value?.roles ?? undefined;
    // Rebuild the sidebar first and independently, so a failure in the
    // menu-access refetch below can never skip it. Best-effort — save succeeded.
    try {
      await refreshMenuNavigation(sessionRoles);
    } catch {
      ShowToast('Menu access saved, but navigation could not be refreshed.', 'warning');
    }
    try {
      await fetchMenuAccess(
        Array.isArray(sessionRoles) && sessionRoles.length > 0 ? sessionRoles.map(String) : [menuRoleId],
      );
    } catch {
      // Menu-access refetch is best-effort.
    }

    return true;
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return false;
  } finally {
    menuAccessSaveIsLoadingSignal.value = false;
  }
};

function isMenuAccessItem(value: unknown): value is MenuAccessItem {
  if (!isApiRecord(value) || !isApiRecord(value.menuLink)) return false;
  const menuLink = value.menuLink;
  return (
    typeof menuLink.id === 'string' &&
    typeof menuLink.name === 'string' &&
    typeof menuLink.active === 'boolean' &&
    typeof value.read === 'boolean' &&
    typeof value.create === 'boolean' &&
    typeof value.update === 'boolean' &&
    typeof value.delete === 'boolean'
  );
}
