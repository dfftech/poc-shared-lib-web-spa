import { computed } from '@preact/signals-react';
import { AppHttp, ShowToast } from 'shared-lib-web';
import { ConstKeys } from 'dff-util';
import { MsUrl } from '../../../../config.ts';
import { hasApiError, hasApiRows, readApiRows } from '../../hooks/api-response.ts';
import {
  adminRolesIsLoadingSignal,
  adminRolesSignal,
  personaSignal,
} from '../../hooks/menu-context.ts';
import type { MenuRole } from './types';

// ─── Option / Load Signals ───────────────────────────────────────────────────
export const roleOptionsSignal = adminRolesSignal;
export const roleIsLoadingSignal = adminRolesIsLoadingSignal;
export const menuRolesSignal = computed<MenuRole[]>(() =>
  adminRolesSignal.value.flatMap((role) => {
    const id = role.key || role.value;
    if (!id) return [];
    return [{
      id,
      name: role.label,
      persona: role.persona || personaSignal.value,
      active: !role.disabled,
      nameLang: role.lang,
    }];
  }),
);

// ─── Option Load Calls ───────────────────────────────────────────────────────
export const roleLoadCall = async (): Promise<MenuRole[]> => {
  try {
    roleIsLoadingSignal.value = true;
    const response = await AppHttp.Post(`${MsUrl.utils}/menu-role-search`, {
      active: true,
      persona: personaSignal.value,
      page: 1,
      limit: 100,
    });
    if (hasApiError(response)) {
      throw new Error('Failed to load menu roles.');
    }
    if (!hasApiRows(response)) {
      throw new Error('The menu role response was not a list.');
    }
    const rows = readApiRows(response).filter(isMenuRole);
    adminRolesSignal.value = rows.map((role) => ({
      key: role.id,
      value: role.id,
      label: role.name,
      persona: role.persona,
      lang: role.nameLang,
      disabled: !role.active,
    }));
    return rows;
  } catch (error) {
    ShowToast(error instanceof Error ? error.message : ConstKeys.WENT_WRONG, 'error');
    throw error;
  } finally {
    roleIsLoadingSignal.value = false;
  }
};

function isMenuRole(value: unknown): value is MenuRole {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.persona === 'string' &&
    typeof value.active === 'boolean'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function loadRolesCall(): Promise<MenuRole[]> {
  try {
    return await roleLoadCall();
  } catch {
    return [];
  }
}
