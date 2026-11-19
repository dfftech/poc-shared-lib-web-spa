import { signal } from '@preact/signals-react';
import type { MenuDrawerMode } from './types';
import { AppStorage, SCREEN_ACTION } from 'shared-lib-web';

// Re-export HTTP and Load services
export * from './service-http';
export * from './service-load';

// ─── Module UI State Signals (No HTTP) ───────────────────────────────────────
export const selectedMenuIdSignal = signal<string>('');
export const menuLinkIsDrawerOpen = signal<boolean>(false);
export const menuLinkDrawerMode = signal<MenuDrawerMode>('create-group');
export const menuLinkIsPopupOpen = signal<boolean>(false);
export const menuLinkIsEditMode = signal<boolean>(false);

// ─── Screen Action / State Updaters ──────────────────────────────────────────
export const applyScreenAction = (action?: string) => {
  const currentAction = String(action || AppStorage.getData(SCREEN_ACTION) || 'menu-link:list');
  const [, kind, id] = currentAction.split(':');
  if (!kind || kind === 'list') {
    editModeUpdate(undefined);
    return;
  }
  if (kind === 'view') {
    editModeUpdate(id || undefined, 'edit-group');
    return;
  }
  if (kind === 'form') {
    editModeUpdate(id || undefined, id ? 'edit-group' : 'create-group');
  }
};

export const editModeUpdate = (menuId?: string, mode?: MenuDrawerMode) => {
  if (menuId) {
    selectedMenuIdSignal.value = menuId;
    menuLinkDrawerMode.value = mode || 'edit-group';
    menuLinkIsDrawerOpen.value = true;
    menuLinkIsPopupOpen.value = true;
    AppStorage.setData(SCREEN_ACTION, `menu-link:form:${menuId}`);
  } else if (mode) {
    selectedMenuIdSignal.value = '';
    menuLinkDrawerMode.value = mode;
    menuLinkIsDrawerOpen.value = true;
    menuLinkIsPopupOpen.value = true;
    AppStorage.setData(SCREEN_ACTION, 'menu-link:form');
  } else {
    selectedMenuIdSignal.value = '';
    menuLinkIsDrawerOpen.value = false;
    menuLinkIsPopupOpen.value = false;
    AppStorage.setData(SCREEN_ACTION, 'menu-link:list');
  }
};
