import { ShowToast, translate } from "shared-lib-web";
import { signal } from "@preact/signals-react";
import { ConstKeys, Countries, type CountryType } from "dff-util";
import type { OptionType } from "./types";
import {
  adminRolesIsLoadingSignal,
  adminRolesSignal,
} from "../../menu/hooks/menu-context.ts";

export const countryIsLoading = signal(false);
export const countryOptions = signal<OptionType[]>([]);

export const countryLoadCall = () => {
  try {
    countryIsLoading.value = true;
    const countryList = Countries && Countries.length > 0 ? Countries : [];
    countryOptions.value = countryList.map((c: CountryType) => ({
      label: `${c.name} (${c.code})`,
      value: c.code,
      key: c.code,
    }));
  } catch {
    ShowToast(ConstKeys.WENT_WRONG, "warning");
    countryOptions.value = [];
  } finally {
    countryIsLoading.value = false;
  }
};

export const languagesIsLoading = signal(false);
export const languagesOptions = signal<OptionType[]>([]);
countryLoadCall();

export const roleIsLoading = adminRolesIsLoadingSignal;
export const roleOptions = adminRolesSignal;

export const addressTypeOptions = signal<OptionType[]>([
  { label: translate("residential"), value: "residential", key: "residential" },
  { label: translate("office"), value: "office", key: "office" },
  { label: translate("headquarters"), value: "headquarters", key: "headquarters" },
  { label: translate("billing"), value: "billing", key: "billing" },
]);

export const providerOptions = signal<OptionType[]>([
  { label: translate("password"), value: "password", key: "password" },
  { label: translate("google"), value: "google", key: "google" },
  { label: translate("sso"), value: "sso", key: "sso" },
  { label: translate("apple"), value: "apple", key: "apple" },
]);

export const telCodeOptions = signal<OptionType[]>([
  { label: translate("telUsCa"), value: "1", key: "1" },
  { label: translate("telIndia"), value: "91", key: "91" },
  { label: translate("telUk"), value: "44", key: "44" },
  { label: translate("telGermany"), value: "49", key: "49" },
  { label: translate("telFrance"), value: "33", key: "33" },
  { label: translate("telAustralia"), value: "61", key: "61" },
  { label: translate("telJapan"), value: "81", key: "81" },
  { label: translate("telChina"), value: "86", key: "86" },
  { label: translate("telUae"), value: "971", key: "971" },
]);
