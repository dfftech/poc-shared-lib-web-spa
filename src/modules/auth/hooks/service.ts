import {
  AppStorage,
  AUTH_USER,
  authUserSignal,
  clearMenu,
  endSession,
  OTP_ID,
  REMEMBER_ME,
  startSession,
  TOKEN,
  translate,
  type AuthUser,
} from 'shared-lib-web';
import { signal } from '@preact/signals-react';
import { JwtDecode, JwtValid } from 'dff-util';
import { personaSignal, refreshMenuNavigation } from '../../menu/hooks/menu-context.ts';
import {
  authForgotPasswordCall,
  authResetPasswordCall,
  authSendOtpCall,
  authSigninCall,
  authSignupCall,
  authVerifyAccountCall,
  authVerifyOtpCall,
  jwtRegenerateCall,
} from './service-http';
import type { AuthResponse, LoginData, SignupData } from './types';

const t = translate;
const REMEMBERED_EMAIL = 'REMEMBERED_EMAIL';
const AuthUserSignal = authUserSignal;
const isAuthLoading = signal(false);

export const authIsPopupOpen = signal(false);
export const authIsEditMode = signal(true);
export const authSelectedId = signal<string | undefined>(undefined);
export const SelectedAuthView = signal<'login' | 'signup' | 'forgot' | 'otp' | 'reset'>('login');
export const authOtpId = signal('');
export const authOtpUid = signal('');
// Form UI state — signals instead of useState (skill: signals).
export const authFormIsLoading = signal(false);
export const authShowPassword = signal(false);
export const authErrorMsg = signal<string | null>(null);
export const authOtpMode = signal<'signup' | 'login'>('signup');

type SessionUser = AuthUser & { isEmailVerified?: boolean };

function userFromDecoded(decoded: Record<string, unknown>, extra?: SessionUser | null): SessionUser {
  const email = String(decoded.email || extra?.email || '').trim();

  const name = String(decoded.name || extra?.name || '').trim();

  return {
    id: String(decoded.id || extra?.id || ''),
    email,
    name,
    pic: extra?.pic,
    persona: personaSignal.value,
    roles: Array.isArray(decoded.roles)
      ? decoded.roles.map(String)
      : Array.isArray(extra?.roles)
        ? extra.roles.map(String)
        : undefined,
    mobile: decoded.mobile ? String(decoded.mobile) : extra?.mobile,
    isEmailVerified: typeof decoded.isEmailVerified === 'boolean' ? decoded.isEmailVerified : extra?.isEmailVerified,
  };
}

export function persistSession(token: string, user?: SessionUser | null, rememberMe = true) {
  AppStorage.setData(REMEMBER_ME, rememberMe);
  try {
    const decoded = JwtDecode(token) as Record<string, unknown>;
    const session = userFromDecoded(decoded, user);
    startSession(token, session, rememberMe);
  } catch {
    if (user) {
      startSession(token, user, rememberMe);
    }
  }
}

export function isRememberMe(): boolean {
  const raw = AppStorage.getData(REMEMBER_ME);
  return raw === true || raw === 'true';
}

export function getRememberedEmail(): string {
  return String(AppStorage.getData(REMEMBERED_EMAIL) || '');
}

function persistRememberedEmail(email: string, rememberMe: boolean) {
  if (rememberMe && email.trim()) {
    AppStorage.setData(REMEMBERED_EMAIL, email.trim());
  } else {
    AppStorage.removeData(REMEMBERED_EMAIL);
  }
}

export function getToken(): string {
  const raw = AppStorage.getData(TOKEN);
  const token = String(raw ?? '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  if (!token || token === 'null' || token === 'undefined') return '';
  return token;
}

export function clearTokens() {
  endSession([REMEMBER_ME, REMEMBERED_EMAIL], false);
  clearMenu();
  authOtpId.value = '';
  authOtpUid.value = '';
}

function rememberOtp(otpId?: string, uid?: string) {
  if (otpId) {
    authOtpId.value = otpId;
    AppStorage.setData(OTP_ID, otpId);
  }
  if (uid) authOtpUid.value = uid;
}

function readOtpId(explicit?: string) {
  return explicit || authOtpId.value || String(AppStorage.getData(OTP_ID) || '');
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  const result = await authForgotPasswordCall(email);
  if (result.success) rememberOtp(result.otpId, result.uid || email);
  return result;
}

export async function sendEmailOTP(email: string): Promise<AuthResponse> {
  const result = await authSendOtpCall(email);
  if (result.success) rememberOtp(result.otpId, result.uid || email);
  return result;
}

export async function verifyEmailOTP(
  email: string,
  otp: string,
  otpId?: string,
  navigate = false
): Promise<AuthResponse> {
  const id = readOtpId(otpId);
  if (!id)
    return {
      success: false,
      error: t('authMissingOtpSession'),
    };
  const result = await authVerifyOtpCall({
    otp,
    otpId: id,
    uid: email.trim(),
    navigate,
  });
  if (result.success) rememberOtp(result.otpId || id, result.uid || email);
  if (result.success && result.token) {
    // Login OTP inherits the remember-me choice saved at the login step.
    persistSession(result.token, result.user || { id: '', email }, isRememberMe());
  }
  return result;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  const result = await authSignupCall(data);
  if (result.success) rememberOtp(result.otpId, result.uid || data.email);
  return result;
}

export async function verifySignupOtp(email: string, otp: string): Promise<AuthResponse> {
  const verified = await verifyEmailOTP(email, otp, undefined, false);
  if (!verified.success) return verified;

  const otpId = readOtpId(verified.otpId);
  if (otpId) {
    const account = await authVerifyAccountCall({ userid: email, otpId });
    if (!account.success) return account;
  }
  return {
    success: true,
    message: verified.message || t('authAccountVerified'),
    otpId,
    uid: email,
  };
}

/**
 * Login OTP step — signin returned `user.isEmailVerified: false`, so verify the
 * `auth-send-otp` code (navigate → auth-verify-otp returns a JWT) and finish sign-in.
 */
export async function verifyLoginOtp(email: string, otp: string): Promise<AuthResponse> {
  const verified = await verifyEmailOTP(email, otp, undefined, true);
  if (verified.success && verified.token) {
    void refreshMenuNavigation(verified.user?.roles ?? undefined);
  }
  return verified;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const rememberMe = data.rememberMe ?? isRememberMe();
  persistRememberedEmail(data.email, rememberMe);
  const result = await authSigninCall(data);
  if (!result.success) return result;

  // Email not verified → send an OTP; the form routes to the OTP step, then verifyLoginOtp completes sign-in.
  // The remember-me flag is already stored (REMEMBER_ME) so the OTP step can inherit it.
  if (result.user?.isEmailVerified === false) {
    const otp = await sendEmailOTP(data.email);
    if (!otp.success) return otp;
    return {
      success: true,
      user: result.user,
      message: otp.message || result.message,
      otpId: otp.otpId,
      uid: otp.uid || data.email.trim(),
    };
  }

  if (result.token) {
    persistSession(
      result.token,
      result.user || ({ id: '', email: data.email } as AuthUser),
      rememberMe
    );
    // Roles come from the signin response → load authorization menus for the sidebar.
    void refreshMenuNavigation(result.user?.roles ?? undefined);
  }
  return result;
}

export async function logoutCall(): Promise<AuthResponse> {
  // clearTokens wipes storage; restore remember-me prefs so the login
  // form can still prefill email and keep the theme choice.
  const rememberedEmail = getRememberedEmail();
  const rememberFlag = isRememberMe();
  clearTokens();
  if (rememberedEmail) AppStorage.setData(REMEMBERED_EMAIL, rememberedEmail);
  AppStorage.setData(REMEMBER_ME, rememberFlag);
  AuthUserSignal.value = null;
  return { success: true, message: t('authSignedOut') };
}

export async function socialLogin(
  _provider: 'google' | 'facebook' | 'apple',
  _merchantId: string
): Promise<AuthResponse> {
  return { success: false, error: t('authSocialUnavailable') };
}

export async function changePassword(_oldPassword: string, _newPassword: string): Promise<AuthResponse> {
  return {
    success: false,
    error: t('authUseForgotPassword'),
  };
}

export async function deleteAccount(): Promise<AuthResponse> {
  clearTokens();
  AuthUserSignal.value = null;
  return {
    success: true,
    message: t('authSignedOutLocally'),
  };
}

export function isSocialLoginUser() {
  return false;
}

export async function setPassword(password: string, confirmPassword: string) {
  if (password !== confirmPassword) {
    return { success: false, error: t('authPasswordsDoNotMatch') };
  }
  return { success: false, error: t('authSetPasswordUnavailable') };
}

export async function resetPassword(useridOrToken: string, newPassword: string, otpId?: string): Promise<AuthResponse> {
  const id = readOtpId(otpId);
  if (!id) {
    return {
      success: false,
      error: t('authMissingOtpSessionReset'),
    };
  }
  return authResetPasswordCall({
    userid: useridOrToken,
    otpId: id,
    password: newPassword,
  });
}

/** Refresh: JwtValid + JwtDecode → SESSION_INFO. */
export async function refreshAuthState() {
  let token = getToken();
  if (token && !JwtValid(token)) {
    const regenerated = await jwtRegenerateCall();
    if (regenerated?.token) {
      persistSession(regenerated.token, AppStorage.getData(AUTH_USER) as SessionUser | null, true);
      token = getToken();
    }
  }
  if (!token || !JwtValid(token)) {
    if (token) clearTokens();
    AuthUserSignal.value = null;
    isAuthLoading.value = false;
    return null;
  }

  try {
    const decoded = JwtDecode(token) as Record<string, unknown>;
    const prev = AppStorage.getData(AUTH_USER) as SessionUser | null;
    const user = userFromDecoded(decoded, prev);
    persistSession(token, user, isRememberMe());
    // Session restore (reload/new tab) → refresh authorization menus from session roles.
    void refreshMenuNavigation(user?.roles ?? undefined);
    isAuthLoading.value = false;
    return { authenticated: true as const, user };
  } catch {
    clearTokens();
    AuthUserSignal.value = null;
    isAuthLoading.value = false;
    return null;
  }
}

export const editModeUpdate = async (id?: string, mode?: 'edit' | 'add') => {
  if (mode === 'add' || mode === 'edit') {
    authIsEditMode.value = true;
    authIsPopupOpen.value = true;
    authSelectedId.value = id;
    SelectedAuthView.value = mode === 'add' ? 'signup' : 'login';
  } else if (id === 'open') {
    authIsPopupOpen.value = true;
  } else {
    authIsPopupOpen.value = false;
    authSelectedId.value = undefined;
  }
};
