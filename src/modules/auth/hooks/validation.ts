import { ConstKeys } from "dff-util";
import { SharedRegExp } from "shared-lib-web";

export const authValidation = {
  email: {
    required: { value: true, message: ConstKeys.REQUIRED },
    pattern: { value: SharedRegExp.EMAIL, message: "Invalid email address" },
  },
  password: {
    required: { value: true, message: ConstKeys.REQUIRED },
    minLength: { value: 8, message: "Password must be at least 8 characters" },
  },
  firstName: { required: { value: true, message: ConstKeys.REQUIRED } },
  lastName: { required: { value: true, message: ConstKeys.REQUIRED } },
  countryCode: { required: { value: true, message: ConstKeys.REQUIRED } },
  mobile: {
    required: { value: true, message: ConstKeys.REQUIRED },
    pattern: {
      value: SharedRegExp.MOBILE_10,
      message: "Invalid mobile number",
    },
  },
  otp: {
    required: { value: true, message: ConstKeys.REQUIRED },
    minLength: { value: 6, message: "Enter the 6-digit code" },
  },
};
