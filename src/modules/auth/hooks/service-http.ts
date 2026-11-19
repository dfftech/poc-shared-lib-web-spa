import { AppHttp, translate } from "shared-lib-web";
import { MsUrl } from "../../../config.ts";
import { personaSignal } from "../../menu/hooks/menu-context.ts";
import type { AuthResponse, LoginData, SignupData } from "./types";

const t = translate;

/** Auth MS wraps payloads in `{ data }`. */
function unwrap<T = Record<string, unknown>>(resp: unknown): T {
  if (resp && typeof resp === "object" && "data" in resp) {
    return (resp as { data: T }).data;
  }
  return resp as T;
}

function errMessage(error: unknown, fallback: string): string {
  const e = error as {
    message?: string;
    error?: { message?: string };
    body?: { message?: string; error?: string };
  };
  return (
    e?.error?.message ||
    e?.body?.message ||
    e?.body?.error ||
    e?.message ||
    fallback
  );
}

/** Auth MS expects passwords as Base64. */
export function encodePassword(plain: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(plain)));
  }
  return Buffer.from(plain, "utf8").toString("base64");
}

type AuthMsProfile = {
  id?: string;
  name?: string;
  email?: string;
  mobile?: string;
  token?: string;
  createdAt?: string;
  persona?: string;
  roles?: string[];
  pic?: string;
  otpId?: string;
  uid?: string;
  message?: string;
  isEmailVerified?: boolean;
};

function toUser(data: AuthMsProfile, fallbackEmail = ""): NonNullable<AuthResponse["user"]> {
  const name = String(data.name || "").trim();
  return {
    id: String(data.id || ""),
    email: String(data.email || fallbackEmail),
    created_at: String(data.createdAt || ""),
    name,
    pic: data.pic ? String(data.pic) : undefined,
    persona: data.persona ? String(data.persona) : personaSignal.value,
    roles: Array.isArray(data.roles) ? data.roles.map(String) : undefined,
    mobile: data.mobile ? String(data.mobile) : undefined,
    isEmailVerified: data.isEmailVerified,
  };
}

export type JwtRegenerateData = {
  token: string;
  createdAt: string;
  currentTime: string;
  expiresAt: string;
  regenerationExpiresAt: string;
};

/** GET {utils}/jwt-regenerate → a fresh JWT (auth header carries the current token). */
export async function jwtRegenerateCall(): Promise<JwtRegenerateData | undefined> {
  try {
    const data = unwrap<JwtRegenerateData>(await AppHttp.Get(`${MsUrl.utils}/jwt-regenerate`));
    return data?.token ? data : undefined;
  } catch (error) {
    console.warn("jwt-regenerate failed", error);
    return undefined;
  }
}

export async function authSigninCall(params: LoginData): Promise<AuthResponse> {
  try {
    const data = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-signin`, {
        userid: params.email.trim(),
        password: encodePassword(params.password),
        provider: "email",
        persona: personaSignal.value,
      }),
    );
    if (!data?.token && data?.isEmailVerified !== false) {
      return { success: false, error: data?.message || t("authSignInFailed") };
    }
    return {
      success: true,
      token: data.token,
      message: data.message,
      user: toUser(data, params.email.trim()),
    };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authSignInFailed")) };
  }
}

export async function authForgotPasswordCall(userid: string, lang = "en-US"): Promise<AuthResponse> {
  try {
    const data = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-forgot-password`, {
        userid: userid.trim(),
        lang,
      }),
    );
    return {
      success: true,
      message: data?.message || t("authAccountExistsResetSent"),
      otpId: data?.otpId,
      uid: data?.uid || userid.trim(),
    };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authFailedSendResetCode")) };
  }
}

export async function authSendOtpCall(userid: string, lang = "en-US"): Promise<AuthResponse> {
  try {
    const data = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-send-otp`, {
        userid: userid.trim(),
        lang,
      }),
    );
    return {
      success: true,
      message: data?.message || t("authOtpSent"),
      otpId: data?.otpId,
      uid: data?.uid || userid.trim(),
    };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authFailedSendOtp")) };
  }
}

export async function authVerifyOtpCall(params: {
  otp: string;
  otpId: string;
  uid: string;
  navigate?: boolean;
}): Promise<AuthResponse> {
  try {
    const data = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-verify-otp`, {
        otp: params.otp,
        otpId: params.otpId,
        uid: params.uid,
        navigate: params.navigate ?? false,
      }),
    );
    return {
      success: true,
      message: data?.message || t("authOtpVerified"),
      otpId: data?.otpId || params.otpId,
      uid: data?.uid || params.uid,
      ...(data?.token ? { token: data.token } : {}),
    };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authOtpVerificationFailed")) };
  }
}

export async function authResetPasswordCall(params: {
  userid: string;
  otpId: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const data = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-reset-password`, {
        userid: params.userid.trim(),
        otpId: params.otpId,
        password: encodePassword(params.password),
      }),
    );
    return {
      success: true,
      message: data?.message || t("authPasswordResetSuccess"),
    };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authFailedResetPassword")) };
  }
}

export async function authVerifyAccountCall(params: {
  userid: string;
  otpId: string;
}): Promise<AuthResponse> {
  try {
    const data = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-verify-account`, {
        userid: params.userid.trim(),
        otpId: params.otpId,
      }),
    );
    return { success: true, message: data?.message || t("authAccountVerified") };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authAccountVerificationFailed")) };
  }
}

export async function authSignupCall(data: SignupData): Promise<AuthResponse> {
  try {
    const name = `${data.firstName} ${data.lastName}`.trim() || data.email;
    const mobile = data.mobile.trim();
    const telCode = String(data.telCode || "").replace(/^\+/, "");
    const result = unwrap<AuthMsProfile>(
      await AppHttp.Post(`${MsUrl.sor}/auth-signup`, {
        userid: data.email.trim(),
        password: encodePassword(data.password),
        name,
        mobile,
        telCode,
        provider: "email",
        persona: personaSignal.value,
      }),
    );
    return {
      success: true,
      message: result?.message || t("authAccountCreated"),
      otpId: result?.otpId,
      uid: result?.uid || data.email.trim(),
      user: {
        id: String(result?.id || ""),
        email: data.email.trim(),
        created_at: "",
        mobile,
        name,
      },
    };
  } catch (error) {
    return { success: false, error: errMessage(error, t("authSignupFailed")) };
  }
}
