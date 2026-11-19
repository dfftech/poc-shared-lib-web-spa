import { AppStorage, SCREEN_ACTION } from "shared-lib-web";
import { batch, signal } from "@preact/signals-react";
import type { OrderType } from "dff-util";
import { getDefaultProfile } from "./data";
import { profileByIdCall } from "./service-http";
import type { ProfileType } from "./types";
import { setScreenRoute } from "../../menu/hooks/screen-route.ts";

export const profileIsPopupOpen = signal(false);
export const profileIsEditMode = signal(false);
export const profileSelectedId = signal<string | undefined>(undefined);
export const SelectedProfile = signal<ProfileType | null>(null);

// ─── List sort state ─────────────────────────────────────────────────────────
// AG Grid's infinite row model already refetches once on every sort change and
// passes the active sort to getRows via params.sortModel. These signals only
// mirror that state; they must NOT trigger another reload (that caused duplicate calls).
export const PROFILES_DEFAULT_ORDER_BY = "updatedOn";
export const PROFILES_DEFAULT_ORDER: OrderType = "ASC";

export const profilesOrderBy = signal<string>(PROFILES_DEFAULT_ORDER_BY);
export const profilesOrder = signal<OrderType>(PROFILES_DEFAULT_ORDER);

export const setProfilesSort = (orderBy: string, order: OrderType) => {
  if (profilesOrderBy.value === orderBy && profilesOrder.value === order) return;
  batch(() => {
    profilesOrderBy.value = orderBy;
    profilesOrder.value = order;
  });
};

export const applyScreenAction = async (
  pathname?: string | null,
  routeId?: string | null,
) => {
  const action = pathname === undefined
    ? String(AppStorage.getData(SCREEN_ACTION) || "profile:list")
    : pathname === "view"
      ? `profile:view:${routeId || ""}`
      : pathname === "edit"
        ? `profile:form:${routeId || ""}`
        : pathname === "create"
          ? "profile:form"
          : pathname
            ? `profile:view:${pathname}`
            : "profile:list";
  const [, kind, id] = action.split(":");
  if (!kind || kind === "list") {
    editModeUpdate(undefined);
    return;
  }
  if (kind === "view") {
    await editModeUpdate(id || undefined);
    return;
  }
  if (kind === "form") {
    if (!id) await editModeUpdate(undefined, "add");
    else await editModeUpdate(id, "edit");
  }
};

export const editModeUpdate = async (id?: string, mode?: "edit" | "add") => {
  if (mode === "add") {
    SelectedProfile.value = getDefaultProfile();
    profileSelectedId.value = undefined;
    profileIsEditMode.value = true;
    profileIsPopupOpen.value = true;
    AppStorage.setData(SCREEN_ACTION, "profile:form");
    setScreenRoute("create");
  } else if (id) {
    AppStorage.setData(
      SCREEN_ACTION,
      mode === "edit" ? `profile:form:${id}` : `profile:view:${id}`
    );
    setScreenRoute(mode === "edit" ? "edit" : "view", id);
    if (
      profileIsPopupOpen.value &&
      profileSelectedId.value === id &&
      profileIsEditMode.value === (mode === "edit") &&
      SelectedProfile.value
    ) {
      return;
    }
    profileSelectedId.value = id;
    profileIsEditMode.value = mode === "edit";
    profileIsPopupOpen.value = true;
    // Fetch profile data for view/edit
    const profile = await profileByIdCall(id);
    if (profile) {
      SelectedProfile.value = profile;
    }
  } else {
    profileSelectedId.value = undefined;
    profileIsEditMode.value = false;
    profileIsPopupOpen.value = false;
    SelectedProfile.value = null;
    AppStorage.setData(SCREEN_ACTION, "profile:list");
    setScreenRoute();
  }
};
