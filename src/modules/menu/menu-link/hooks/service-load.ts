import type { OptionType } from "dff-util";
import { AppHttp, ShowToast, localeSignal } from "shared-lib-web";
import { signal } from "@preact/signals-react";
import { ConstKeys } from "dff-util";
import {
  fetchMenuGroups,
  menuGroupsSignal,
  personaSignal,
} from "./service-http";

// ─── Option / Load Signals ───────────────────────────────────────────────────
export const menuGroupOptionsSignal = signal<OptionType[]>([
  { label: "Root", key: "ROOT" },
]);
export const menuGroupOptionsIsLoadingSignal = signal<boolean>(false);

// ─── Option Load Calls ───────────────────────────────────────────────────────
type MenuGroupLoadItem = {
  key?: string;
  value?: string;
  id?: string;
  label?: string;
  name?: string;
  nameLang?: Record<string, string>;
  title?: string;
  disabled?: boolean;
};

export const loadMenuGroupOptions = async (
  id = "MENU_GROUPS",
  params = { persona: personaSignal.value }
) => {
  try {
    menuGroupOptionsIsLoadingSignal.value = true;
    let rows: MenuGroupLoadItem[] = [];

    try {
      const respLoad = await AppHttp.Load(id, params);
      rows = readMenuGroupRows(respLoad);
    } catch {
      rows = [];
    }

    // Fallback to existing menuGroupsSignal or fetchMenuGroups
    if (rows.length === 0 && menuGroupsSignal.value.length > 0) {
      rows = menuGroupsSignal.value;
    } else if (rows.length === 0) {
      rows = await fetchMenuGroups();
    }

    const mappedGroups = rows
      .filter((group) => {
        const val = String(group.value || group.id || group.key || "");
        return val !== "" && val !== "ROOT" && val !== "ROOT_GROUP";
      })
      .filter(
        (group, index, self) =>
          self.findIndex((g) => {
            const v1 = String(g.value || g.id || g.key || "");
            const v2 = String(group.value || group.id || group.key || "");
            return v1 === v2;
          }) === index
      )
      .map((group) => {
        const val = String(group.value || group.id || group.key || "");
        const label =
          group.label ||
          (group.nameLang &&
            (group.nameLang[localeSignal.value] || group.nameLang["en-US"])) ||
          group.name ||
          group.title ||
          group.key ||
          val;
        return {
          label: String(label),
          key: String(group.key || group.id || group.value || val),
          disabled: Boolean(group.disabled),
        };
      });

    menuGroupOptionsSignal.value = [
      { label: "Root", key: "ROOT" },
      ...mappedGroups,
    ];
  } catch {
    ShowToast(ConstKeys.WENT_WRONG, "warning");
    menuGroupOptionsSignal.value = [
      { label: "Root", key: "ROOT" },
    ];
  } finally {
    menuGroupOptionsIsLoadingSignal.value = false;
  }
};

function readMenuGroupRows(response: unknown): MenuGroupLoadItem[] {
  const rows = Array.isArray(response)
    ? response
    : isRecord(response) && Array.isArray(response.data)
      ? response.data
      : [];
  return rows.filter(isMenuGroupLoadItem);
}

function isMenuGroupLoadItem(value: unknown): value is MenuGroupLoadItem {
  return (
    isRecord(value) &&
    ["key", "value", "id", "label", "name", "title", "disabled"].every(
      (field) => value[field] === undefined || ["string", "boolean"].includes(typeof value[field]),
    ) &&
    (value.nameLang === undefined || isStringRecord(value.nameLang))
  );
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
