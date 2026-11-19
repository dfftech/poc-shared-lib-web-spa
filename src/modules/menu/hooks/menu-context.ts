import { effect, signal } from "@preact/signals-react";
import {
  AppHttp,
  authUserSignal,
  localeSignal,
  setNavigation,
  toNavigation,
  type MenuAccessType,
} from "shared-lib-web";
import { MsUrl } from "../../../config.ts";

export interface MenuRoleOption {
  key: string;
  value: string;
  label: string;
  persona?: string;
  lang?: Record<string, string>;
  disabled?: boolean;
}

export const personaSignal = signal(authUserSignal.peek()?.persona ?? "admin");
export const adminRolesSignal = signal<MenuRoleOption[]>([]);
export const adminRolesIsLoadingSignal = signal(false);
export const SessionLang = localeSignal;
export const AuthUserSignal = authUserSignal;

effect(() => {
  const persona = authUserSignal.value?.persona;
  if (persona) {
    personaSignal.value = persona;
  }
});

export async function refreshMenuNavigation(roles?: string[]): Promise<void> {
  const roleIds = roles ?? authUserSignal.value?.roles ?? ["ADMIN_ADMIN"];
  const persona = authUserSignal.value?.persona ?? personaSignal.value;
  const response = await AppHttp.Get(
    `${MsUrl.utils}/authorization/${encodeURIComponent(persona)}`,
    { roles: roleIds.join(",") },
  );
  const menuRows = readMenuRows(response);
  setNavigation(toNavigation(menuRows));
}

export function pickMenuName(
  nameLang: Record<string, string> | undefined,
  fallback: string,
  language: string,
): string {
  const baseLanguage = language.split("-")[0];
  return (
    nameLang?.[language] ??
    nameLang?.[baseLanguage] ??
    Object.entries(nameLang ?? {}).find(([code]) => code.startsWith(`${baseLanguage}-`))?.[1] ??
    fallback
  );
}

export function isAdminRootMenu(id: string): boolean {
  return id.toUpperCase().endsWith("_ROOT");
}

export interface LocalizableMenuItem {
  name: string;
  nameLang?: Record<string, string>;
  children?: LocalizableMenuItem[];
}

export function localizeMenuAccess<T extends LocalizableMenuItem>(
  items: T[],
  language: string,
): T[] {
  return items.map((item) => ({
    ...item,
    name: pickMenuName(item.nameLang, item.name, language),
    ...(item.children ? { children: localizeMenuAccess(item.children, language) } : {}),
  }));
}

function readMenuRows(response: unknown): MenuAccessType[] {
  const rows = Array.isArray(response)
    ? response
    : isRecord(response) && isRecord(response.data) && Array.isArray(response.data.data)
      ? response.data.data
      : isRecord(response) && Array.isArray(response.data)
        ? response.data
        : undefined;
  if (!rows) {
    throw new Error("The navigation response was not a list.");
  }
  const menus = rows.filter(isMenuAccessType);
  if (menus.length !== rows.length) {
    throw new Error("The navigation response contains invalid menu items.");
  }
  return menus;
}

function isMenuAccessType(value: unknown): value is MenuAccessType {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    (value.id === undefined || typeof value.id === "string") &&
    (value.children === undefined || Array.isArray(value.children))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
