import { signal } from '@preact/signals-react';
import type { TransformedMenuAccessType } from './types';
import { menuAccessDataSignal } from './service-http';
import { AppStorage, SCREEN_ACTION } from 'shared-lib-web';

// Re-export all HTTP and Load services
export * from './service-http';
export * from './service-load';

// ─── Module UI State Signals (No HTTP) ───────────────────────────────────────
export const selectedRoleIdSignal = signal<string>('');
export const menuAccessIsPopupOpen = signal<boolean>(false);
export const menuAccessIsEditMode = signal<boolean>(false);

// ─── Screen Action / State Updaters ──────────────────────────────────────────
export const applyScreenAction = (action?: string) => {
  const currentAction = String(action || AppStorage.getData(SCREEN_ACTION) || 'menu-access:list');
  const [, kind, id] = currentAction.split(':');
  if (!kind || kind === 'list') {
    editModeUpdate(undefined);
    return;
  }
  if (kind === 'view') {
    editModeUpdate(id || undefined);
    return;
  }
  if (kind === 'form') {
    editModeUpdate(id || undefined, 'edit');
  }
};

export const editModeUpdate = (roleId?: string, mode?: 'edit' | 'add') => {
  if (roleId) {
    selectedRoleIdSignal.value = roleId;
    menuAccessIsEditMode.value = mode === 'edit';
    menuAccessIsPopupOpen.value = true;
    AppStorage.setData(SCREEN_ACTION, `menu-access:form:${roleId}`);
  } else {
    menuAccessIsEditMode.value = false;
    menuAccessIsPopupOpen.value = false;
    AppStorage.setData(SCREEN_ACTION, 'menu-access:list');
  }
};

// ─── Permission Check Helper ─────────────────────────────────────────────────
export const checkMenuPermission = (
  menuIdentifier: string,
  action: 'read' | 'create' | 'update' | 'delete' = 'read',
): boolean => {
  const menuData = menuAccessDataSignal.value;
  if (!menuData || menuData.length === 0) return true;

  const findMenuItem = (
    items: TransformedMenuAccessType[],
  ): TransformedMenuAccessType | undefined => {
    for (const item of items) {
      if (item.href === menuIdentifier || item.name === menuIdentifier) return item;
      if (item.children) {
        const found = findMenuItem(item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const item = findMenuItem(menuData);
  if (!item) return true;
  return item.permissions?.[action] ?? true;
};
