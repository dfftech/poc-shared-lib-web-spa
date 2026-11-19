import { signal } from '@preact/signals-react';
import { getDefaultRole } from './data';
import type { MenuRole } from './types';
import { AppStorage, SCREEN_ACTION } from 'shared-lib-web';

// Re-export HTTP and Load services
export * from './service-http';
export * from './service-load';

// ─── Module UI State Signals (No HTTP) ───────────────────────────────────────
export const roleIsPopupOpen = signal<boolean>(false);
export const roleIsEditMode = signal<boolean>(false);
export const roleSelectedId = signal<string | undefined>(undefined);
export const SelectedRole = signal<MenuRole | null>(null);

// ─── Screen Action / State Updaters ──────────────────────────────────────────
export const applyScreenAction = (action?: string) => {
  const currentAction = String(action || AppStorage.getData(SCREEN_ACTION) || 'role:list');
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
    if (!id) editModeUpdate(undefined, 'add');
    else editModeUpdate(id, 'edit');
  }
};

export const editModeUpdate = async (id?: string, mode?: 'edit' | 'add') => {
  if (mode === 'add') {
    SelectedRole.value = getDefaultRole();
    roleSelectedId.value = undefined;
    roleIsEditMode.value = true;
    roleIsPopupOpen.value = true;
    AppStorage.setData(SCREEN_ACTION, 'role:form');
  } else if (id) {
    roleSelectedId.value = id;
    roleIsEditMode.value = mode === 'edit';
    roleIsPopupOpen.value = true;
    AppStorage.setData(SCREEN_ACTION, mode === 'edit' ? `role:form:${id}` : `role:view:${id}`);
  } else {
    roleSelectedId.value = undefined;
    roleIsEditMode.value = false;
    roleIsPopupOpen.value = false;
    AppStorage.setData(SCREEN_ACTION, 'role:list');
  }
};
