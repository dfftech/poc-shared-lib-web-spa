import { ConstKeys } from "dff-util";
import { SharedRegExp } from "shared-lib-web";

export const profileValidation = {
  name: {
    required: { value: true, message: ConstKeys.REQUIRED },
    minLength: { value: 2, message: ConstKeys.MIN_LENGTH_REQUIRED },
  },
  email: {
    required: { value: true, message: ConstKeys.REQUIRED },
    pattern: { value: SharedRegExp.EMAIL, message: "Invalid email address." },
  },
  password: {
    required: { value: true, message: ConstKeys.REQUIRED },
    minLength: { value: 6, message: ConstKeys.MIN_LENGTH_REQUIRED },
  },
  mobile: {
    required: { value: true, message: ConstKeys.REQUIRED },
    pattern: { value: SharedRegExp.MOBILE_10, message: "Invalid mobile number." },
  },
  telCode: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  persona: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  roles: {
    required: { value: true, message: ConstKeys.REQUIRED },
    validate: (value: unknown) =>
      (Array.isArray(value) ? value.length > 0 : Boolean(value)) || ConstKeys.REQUIRED,
  },
  addressType: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  streetAddress: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  city: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  state: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  postalCode: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
  country: {
    required: { value: true, message: ConstKeys.REQUIRED },
  },
};
