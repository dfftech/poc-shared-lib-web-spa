"use client";

import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { useScreenRouteSearchParams } from "../menu/hooks/screen-route.ts";
import {
  applyScreenAction,
  editModeUpdate,
  profileIsEditMode,
  profileIsPopupOpen,
} from "./hooks/service";
import { ProfileForm } from "./components/profile.form.tsx";
import { ProfileList } from "./components/profile.list.tsx";
import { ProfileView } from "./components/profile.view.tsx";

export function ProfilePage() {
  useSignals();
  const searchParams = useScreenRouteSearchParams();
  const pathname = searchParams.get("pathname");
  const id = searchParams.get("id");

  useEffect(() => {
    void applyScreenAction(pathname, id);
  }, [pathname, id]);

  return (
    <>
      <ProfileList />

      {profileIsPopupOpen.value && (
        <div className="modal modal-open z-50">
          <div
            className="modal-backdrop bg-black/40"
            role="button"
            tabIndex={0}
            onClick={() => editModeUpdate(undefined)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && editModeUpdate(undefined)
            }
          />
          <div className="modal-box fixed right-0 top-0 h-screen w-full max-w-2xl rounded-none p-0 bg-base-100 text-base-content shadow-2xl border-l border-base-300">
            <div className="h-full overflow-y-auto p-6">
              {profileIsEditMode.value ? <ProfileForm /> : <ProfileView />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
