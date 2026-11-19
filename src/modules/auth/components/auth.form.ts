"use client";

import { ShowToast, openPage, setQueryParams, useQueryParam } from "shared-lib-web";
import { useEffect, useState, useTransition } from "react";
import { useAuthTranslation } from "../hooks/use-auth-translation";
import {
  SelectedAuthView,
  authIsPopupOpen,
  editModeUpdate,
  forgotPassword,
  getRememberedEmail,
  isRememberMe,
  login,
  resetPassword,
  verifyEmailOTP,
  verifyLoginOtp,
} from "../hooks/service";

export type AuthView = "login" | "forgot" | "otp" | "reset";

/** Canonical ?pathname= value for each auth screen (URL is the source of truth). */
export const authViewToPathname = (view: string): string => {
  switch (view) {
    case "forgot":
      return "forgotpassword";
    case "reset":
      return "resetpassword";
    case "otp":
      return "otp";
    case "signup":
      return "signup";
    default:
      return "sign-in";
  }
};

/** ?pathname= value (sign-in | forgotpassword | resetpassword | otp) → auth view. */
export const pathnameToAuthView = (value?: string | null): AuthView => {
  switch (String(value || "").trim().toLowerCase()) {
    case "forgot":
    case "forgotpassword":
      return "forgot";
    case "reset":
    case "resetpassword":
      return "reset";
    case "otp":
      return "otp";
    // "login" is the old value; kept so existing bookmarks still open the sign-in view.
    case "sign-in":
    case "login":
    default:
      return "login";
  }
};

export function useAuthForm() {
  const [isPending, startTransition] = useTransition();
  const { t } = useAuthTranslation();
  // URL is the source of truth — /auth?pathname=sign-in | forgotpassword | resetpassword.
  // Deriving the view (instead of local state + effect) keeps deep links, back and
  // forward in sync without setState-in-effect.
  const currentPathname = useQueryParam("pathname");
  const view = pathnameToAuthView(currentPathname);
  const [email, setEmail] = useState(() => getRememberedEmail());
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => isRememberMe());
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Mirror the active screen on the signals consumed by auth.view.ts / editModeUpdate.
  useEffect(() => {
    if (SelectedAuthView.value !== view) SelectedAuthView.value = view;
    if (!authIsPopupOpen.value) editModeUpdate("open");
  }, [view]);

  const setView = (next: AuthView) => {
    const pathname = authViewToPathname(next);
    if (currentPathname !== pathname) {
      setQueryParams({ pathname }, { isReplace: true });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await login({ email, password, rememberMe });
        if (result.success && result.user?.isEmailVerified === false) {
          ShowToast(result.message || t("authOtpSentToEmail"), "info");
          setView("otp");
          return;
        }
        if (result.success) {
          ShowToast(t("authLoginSuccessful"), "success");
          openPage("/dashboard");
        } else {
          setError(result.error || result.message || t("authInvalidCredentials"));
        }
      } catch (err: any) {
        setError(err?.message || t("authSomethingWentWrong"));
      }
    });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await forgotPassword(email);
        if (result.success) {
          ShowToast(result.message || t("authResetCodeSent"), "success");
          setView("reset");
        } else {
          setError(result.error || t("authFailedSendResetCode"));
        }
      } catch (err: any) {
        setError(err?.message || t("authFailedSendResetCode"));
      }
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const verified = await verifyEmailOTP(email, otp);
        if (!verified.success) {
          setError(verified.error || t("authInvalidOtp"));
          return;
        }
        const result = await resetPassword(email, newPassword);
        if (result.success) {
          ShowToast(result.message || t("authPasswordUpdated"), "success");
          setPassword(newPassword);
          setView("login");
        } else {
          setError(result.error || t("authPasswordResetFailed"));
        }
      } catch (err: any) {
        setError(err?.message || t("authFailedResetPassword"));
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await verifyLoginOtp(email, otp);
        if (result.success && result.token) {
          ShowToast(result.message || t("authLoginSuccessful"), "success");
          openPage("/dashboard");
          return;
        }
        if (result.success) {
          ShowToast(result.message || t("authEmailVerified"), "success");
          setView("login");
        } else {
          setError(result.error || t("authOtpVerificationFailed"));
        }
      } catch (err: any) {
        setError(err?.message || t("authFailedVerifyOtp"));
      }
    });
  };

  return {
    isPending,
    view,
    setView,
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    rememberMe,
    setRememberMe,
    error,
    setError,
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword,
    handleLogin,
    handleForgot,
    handleResetPassword,
    handleVerifyOtp,
  };
}
