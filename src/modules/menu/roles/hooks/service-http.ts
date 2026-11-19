import { AppHttp, ShowToast } from 'shared-lib-web';
import { signal } from '@preact/signals-react';
import { ConstKeys } from 'dff-util';
import { MsUrl } from '../../../../config.ts';
import { personaSignal } from '../../hooks/menu-context.ts';
import { hasApiError, isApiRecord } from '../../hooks/api-response.ts';
import type { MenuRole } from './types';
export { personaSignal };

// ─── Signals ─────────────────────────────────────────────────────────────────
export const menuRoleSaveIsLoadingSignal = signal<boolean>(false);
export const menuRoleDeleteIsLoadingSignal = signal<boolean>(false);

// ─── HTTP API Calls ──────────────────────────────────────────────────────────
export const createMenuRole = async (data: {
  id?: string;
  name: string;
  persona: string;
  active: boolean;
  nameLang?: Record<string, string>;
}): Promise<{ roleId: string | null; success: boolean }> => {
  try {
    menuRoleSaveIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-role-save`;
    const payload = {
      ...data,
      persona: personaSignal.value,
      nameLang: data.nameLang || { 'en-US': data.name },
    };

    const resp = await AppHttp.Post(url, payload);

    const responseRecord = isApiRecord(resp) ? resp : {};
    const responseData = isApiRecord(responseRecord.data) ? responseRecord.data : {};
    if (
      hasApiError(resp) ||
      responseRecord.success === false ||
      responseData.success === false
    ) {
      throw { error: { message: 'Failed to save menu role' } };
    }

    const roleId =
      data.id ||
      (typeof responseData.id === 'string' && responseData.id) ||
      (typeof responseRecord.id === 'string' && responseRecord.id) ||
      null;
    ShowToast('Role saved successfully', 'success');
    return { roleId, success: true };
  } catch (error: unknown) {
    const err = error as { message?: string; error?: { message?: string } };
    const message = err?.message || err?.error?.message || ConstKeys.WENT_WRONG;
    ShowToast(message, 'error');
    return { roleId: null, success: false };
  } finally {
    menuRoleSaveIsLoadingSignal.value = false;
  }
};

export const fetchRoleEntity = async (id: string): Promise<MenuRole | null> => {
  try {
    const url = `${MsUrl.utils}/menu-role-entity/${encodeURIComponent(id)}`;
    const resp = await AppHttp.Get(url, {});
    if (hasApiError(resp)) throw new Error('Failed to fetch menu role.');
    const responseRecord = isApiRecord(resp) ? resp : undefined;
    const role = responseRecord && isApiRecord(responseRecord.data)
      ? responseRecord.data
      : responseRecord;
    return role && isMenuRole(role) ? role : null;
  } catch {
    ShowToast(ConstKeys.WENT_WRONG, 'error');
    return null;
  }
};

function isMenuRole(value: unknown): value is MenuRole {
  return (
    isApiRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.persona === 'string' &&
    typeof value.active === 'boolean'
  );
}

export const deleteMenuRole = async (id: string): Promise<boolean> => {
  try {
    menuRoleDeleteIsLoadingSignal.value = true;
    const url = `${MsUrl.utils}/menu-role-delete`;
    const response = await AppHttp.Post(url, { id });
    if (hasApiError(response)) throw new Error('Failed to delete menu role.');
    ShowToast('Role deleted successfully', 'success');
    return true;
  } catch {
    ShowToast(ConstKeys.WENT_WRONG, 'error');
    return false;
  } finally {
    menuRoleDeleteIsLoadingSignal.value = false;
  }
};
