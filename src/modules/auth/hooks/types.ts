import type { AuthUser } from "shared-lib-web";

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
  otpId?: string;
  uid?: string;
  user?: AuthUser & {
    created_at?: string;
    isEmailVerified?: boolean;
  };
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  telCode?: string;
}

export type AuthFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  mobile: string;
  otp: string;
  acceptTerms: boolean;
  rememberMe: boolean;
};

