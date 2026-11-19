import { Mail, MapPin, Shield, Copy, Check, X } from "lucide-react";
import { ContentLayout, HeadLayout, TypeButton } from "shared-lib-web";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import { useProfileView } from "./profile.view.ts";
import { ProfileRoleDisplay } from "./profile-role-display.tsx";
import {
  getInitials,
  getAvatarColor,
  getPersonaBadge,
} from "./profile.grid.ts";

export function ProfileView() {
  const { t } = useProfileTranslation();
  const {
    profile,
    canUpdate,
    cancelProps,
    editActionProps,
    copiedKey,
    copyToClipboard,
  } = useProfileView();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 opacity-60">
        <span className="loading loading-spinner loading-lg text-primary mb-4" />
        <p>{t("loadingProfileDetails")}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full space-y-6 text-base-content">
      <HeadLayout
        title={t("user.viewTitle")}
        actions={
          <>
            {canUpdate && <TypeButton {...editActionProps} />}
            <button
              type="button"
              onClick={cancelProps.onPress}
              className="btn btn-ghost btn-sm btn-circle opacity-70 hover:opacity-100 hover:bg-base-200"
              title={t("close")}
            >
              <X size={18} />
            </button>
          </>
        }
      />
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-base-200 border border-base-300 shadow-2xs">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(
              profile.name,
            )} flex items-center justify-center text-lg font-bold shadow-md shrink-0 text-white`}
          >
            {getInitials(profile.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate">{profile.name}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPersonaBadge(
                  profile.persona,
                )} capitalize`}
              >
                {profile.persona}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  profile.active
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-base-300 text-base-content/70"
                }`}
              >
                {profile.active ? t("active") : t("inactive")}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs opacity-60">
              <span className="font-mono">{profile.id}</span>
              <span>•</span>
              <span>
                {t("provider")}: {profile.provider || t("password")}
              </span>
            </div>
          </div>
      </div>

      <ContentLayout className="flex-1 overflow-y-auto space-y-6 pr-1">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold pb-2 border-b border-base-300">
            <Mail size={16} className="text-primary" />
            <span>{t("contactInformation")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("email")}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold">{profile.email}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.email, "email")}
                  className="opacity-60 hover:opacity-100 p-1 rounded"
                >
                  {copiedKey === "email" ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("mobilePhone")}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold">
                  +{String(profile.telCode || "").replace(/^\+/, "")}{" "}
                  {profile.mobile}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `+${String(profile.telCode || "").replace(/^\+/, "")}${profile.mobile}`,
                      "phone",
                    )
                  }
                  className="opacity-60 hover:opacity-100 p-1 rounded"
                >
                  {copiedKey === "phone" ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("authProvider")}
              </span>
              <p className="text-sm font-semibold mt-1 capitalize">
                {profile.provider || t("password")}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold pb-2 border-b border-base-300">
            <Shield size={16} className="text-secondary" />
            <span>{t("rolesAccessScope")}</span>
          </div>

          <div className="pt-1">
            <ProfileRoleDisplay roles={profile.roles} />
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold pb-2 border-b border-base-300">
            <MapPin size={16} className="text-primary" />
            <span>{t("physicalAddressLocation")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("addressType")}
              </span>
              <p className="text-sm font-semibold mt-1 capitalize">
                {profile.addressType || t("residential")}
              </p>
            </div>

            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("streetAddress")}
              </span>
              <p className="text-sm font-semibold mt-1">
                {profile.streetAddress || "—"}
              </p>
            </div>

            {profile.suite && (
              <div>
                <span className="text-xs opacity-60 font-medium">
                  {t("suiteApt")}
                </span>
                <p className="text-sm font-semibold mt-1">{profile.suite}</p>
              </div>
            )}

            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("cityState")}
              </span>
              <p className="text-sm font-semibold mt-1">
                {profile.city || "—"}, {profile.state || ""}
              </p>
            </div>

            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("postalCode")}
              </span>
              <p className="text-sm font-semibold mt-1">
                {profile.postalCode || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs opacity-60 font-medium">
                {t("country")}
              </span>
              <p className="text-sm font-semibold mt-1">
                {profile.country || "—"}
              </p>
            </div>
          </div>
        </div>
      </ContentLayout>
    </div>
  );
}
