import { personaSignal } from "../../menu/hooks/menu-context.ts";
import type { CountryDialItem, ProfileType } from "./types";

// Only US and Canada supported
export const SUPPORTED_COUNTRY_ITEMS: CountryDialItem[] = [
  {
    iso: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
  },
  {
    iso: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
  },
];

export const profileInitValues: ProfileType = {
  id: "",
  name: "",
  nameLang: "en",
  email: "",
  password: "",
  telCode: "+1",
  mobile: "",
  persona: personaSignal.value,
  roles: ["ADMIN_ADMIN"],
  active: true,
  provider: "password",

  addressType: "residential",
  streetAddress: "",
  suite: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export const getDefaultProfile = (): ProfileType => ({
  ...profileInitValues,
  id: `USER_${Date.now().toString(36).toUpperCase()}`,
});
