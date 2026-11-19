import type { AuthFormValues } from "./types";

export const authInitValues: AuthFormValues = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  countryCode: "CA",
  mobile: "",
  otp: "",
  acceptTerms: false,
  rememberMe: false,
};

export const getDefaultAuth = (): AuthFormValues => ({ ...authInitValues });
