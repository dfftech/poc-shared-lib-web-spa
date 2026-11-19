import { AppHttp, ShowToast } from "shared-lib-web";
import { signal } from '@preact/signals-react';
import { ConstKeys } from 'dff-util';
import { MsUrl } from "../../../config.ts";
import type { AddressType, ProfileAddressType, ProfileType, ResponseType, SearchType } from './types';

function toResponseType(value: unknown): ResponseType {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError("The profile service returned an invalid response.");
  }
  const response = value as Record<string, unknown>;
  return {
    ...(typeof response.status === "string" || typeof response.status === "number"
      ? { status: response.status }
      : {}),
    ...(Object.hasOwn(response, "data") ? { data: response.data } : {}),
    ...(Object.hasOwn(response, "error") ? { error: response.error } : {}),
    ...(typeof response.total === "number" ? { total: response.total } : {}),
  };
}

async function post(url: string, body: unknown): Promise<ResponseType> {
  return toResponseType(await AppHttp.Post(url, body));
}

async function get(url: string): Promise<ResponseType> {
  return toResponseType(await AppHttp.Get(url));
}

export const profileListIsLoading = signal(false);
export const profileSaveIsLoading = signal(false);
export const profileDeleteIsLoading = signal(false);
export const profileStatusIsLoading = signal(false);

// ─── Profile Endpoints ───────────────────────────────────────────────────────

export const profileListCall = async (
  params?: SearchType & { persona?: string; lang?: string; status?: string }
): Promise<ResponseType | undefined> => {
  try {
    profileListIsLoading.value = true;
    const body: Record<string, unknown> = {
      skip: params?.skip ?? 0,
      limit: params?.limit ?? 50,
      searchTerm: params?.searchTerm ?? '',
      active: true
    };
    if (params?.orderBy) body.orderBy = params.orderBy;
    if (params?.order) body.order = params.order;
    if (params?.status && params.status !== 'all') {
      body.active = params.status === 'active';
    }
    if (params?.persona && params.persona !== 'all') {
      body.persona = params.persona;
    }
    if (params?.lang && params.lang !== 'all') {
      body.lang = params.lang;
    }

    const resp = await post(`${MsUrl.utils}/profile-search`, body);
    if (resp?.data && Array.isArray(resp.data)) {
      return {
        status: resp.status || 200,
        data: resp.data,
        total: resp.total ?? resp.data.length,
      };
    }
    return { status: 200, data: [], total: 0 };
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
    return { status: 500, data: [], total: 0 };
  } finally {
    profileListIsLoading.value = false;
  }
};

export const profileByIdCall = async (id: string): Promise<ProfileType | undefined> => {
  try {
    const resp = await get(`${MsUrl.utils}/profile-entity/${id}`);
    if (resp?.data) {
      const profile: ProfileType = { ...resp.data };

      // Load associated address from profile-address integration
      try {
        const addrLinks = await profileAddressSearchCall({
          profileId: id,
          limit: 1,
        });
        const addressId = addrLinks?.data?.[0]?.addressId || addrLinks?.data?.[0]?.id;
        if (addressId) {
          const addressData = await addressByIdCall(addressId);
          if (addressData) {
            profile.addressId = addressData.id;
            profile.streetAddress = addressData.address || '';
            profile.suite = addressData.area || '';
            profile.city = addressData.city || '';
            profile.state = addressData.state || '';
            profile.country = addressData.country || '';
            profile.postalCode = addressData.zipcode || '';
            profile.addressType = (addressData.type as ProfileType['addressType']) || 'residential';
          }
        }
      } catch {
        // Address load failure should not block profile display
      }

      return profile;
    }
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
  }
  return undefined;
};

export const profileSaveCall = async (profile: ProfileType): Promise<ResponseType | undefined> => {
  try {
    profileSaveIsLoading.value = true;

    // 1. Save Profile Core Entity
    const profilePayload = {
      id: profile.id,
      name: profile.name,
      nameLang: { [`${profile.nameLang}`]: profile.name },
      email: profile.email,
      mobile: profile.mobile,
      telCode: profile.telCode,
      persona: profile.persona,
      roles: Array.isArray(profile.roles) ? profile.roles : profile.roles ? [profile.roles] : [],
      active: profile.active ?? false,
      provider: profile.provider,
      ...(profile.password ? { password: profile.password } : {}),
    };

    const resp = await post(`${MsUrl.utils}/profile-save`, profilePayload);

    if (resp?.status === 'success' || resp?.data) {
      // 2. Save Address Entity if address fields are populated
      const hasAddress =
        profile.streetAddress || profile.city || profile.state || profile.postalCode || profile.country;

      if (hasAddress) {
        try {
          let addressId = profile.addressId;
          const addressResp = await addressSaveCall({
            ...(addressId ? { id: addressId } : {}),
            address: profile.streetAddress || '',
            area: profile.suite || '',
            city: profile.city || '',
            state: profile.state || '',
            country: profile.country || 'US',
            zipcode: profile.postalCode || '',
            type: profile.addressType || 'residential',
          });

          if (!addressId) {
            addressId = addressResp?.data?.id;
          }
          if (addressId) {
            await profileAddressSaveCall({
              profileId: profile.id,
              addressId,
            });
          }
        } catch {
          // Secondary address sync error handled gracefully
        }
      }

      ShowToast('Profile saved successfully', 'success');
      return resp;
    }
    ShowToast(resp?.error || ConstKeys.WENT_WRONG, 'error');
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'error');
  } finally {
    profileSaveIsLoading.value = false;
  }
};

export const profileDeleteCall = async (id: string): Promise<ResponseType | undefined> => {
  try {
    profileDeleteIsLoading.value = true;
    const resp = await post(`${MsUrl.utils}/profile-delete`, {
      id,
    });
    ShowToast('Profile deleted', 'success');
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'error');
  } finally {
    profileDeleteIsLoading.value = false;
  }
};

export const profileStatusCall = async (id: string, active: boolean): Promise<ResponseType | undefined> => {
  try {
    profileStatusIsLoading.value = true;
    const resp = await post(`${MsUrl.utils}/profile-status`, {
      id,
      active,
    });
    ShowToast('Profile status updated', 'success');
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'error');
  } finally {
    profileStatusIsLoading.value = false;
  }
};

export const profileHashSaveCall = async (data: {
  id: string;
  provider?: string;
  password?: string;
}): Promise<ResponseType | undefined> => {
  try {
    const resp = await post(`${MsUrl.utils}/profile-hash-save`, {
      id: data.id,
      provider: data.provider || 'password',
      password: data.password,
    });
    if (resp.status === 'success' || resp.data) {
      return resp;
    }
    ShowToast(resp.error || ConstKeys.WENT_WRONG, 'error');
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
    return undefined;
  }
};

// ─── Address Endpoints (from botnbolt-docs/rest/utils/address.rest) ──────────

export const addressSaveCall = async (address: AddressType): Promise<ResponseType | undefined> => {
  try {
    const resp = await post(`${MsUrl.utils}/address-save`, address as Record<string, unknown>);
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
    return undefined;
  }
};

export const addressByIdCall = async (id: string): Promise<AddressType | undefined> => {
  try {
    const resp = await get(`${MsUrl.utils}/address-entity/${id}`);
    if (resp?.data) return resp.data;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
  }
  return undefined;
};

export const addressSearchCall = async (params: {
  searchTerm?: string;
  type?: string;
  city?: string;
  state?: string;
  limit?: number;
  skip?: number;
}): Promise<ResponseType | undefined> => {
  try {
    const resp = await post(`${MsUrl.utils}/address-search`, params);
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
    return undefined;
  }
};

// ─── Profile-Address Link Endpoints (profile-address.rest) ───────────────────

export const profileAddressSaveCall = async (data: {
  profileId: string;
  addressId: string;
}): Promise<ResponseType | undefined> => {
  try {
    const resp = await post(`${MsUrl.utils}/profile-address-save`, data);
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
    return undefined;
  }
};

export const profileAddressSearchCall = async (params: {
  profileId: string;
  limit?: number;
  skip?: number;
}): Promise<ResponseType | undefined> => {
  try {
    const resp = await post(`${MsUrl.utils}/profile-address-search`, params);
    return resp;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
    return undefined;
  }
};

export const profileAddressByIdCall = async (id: string): Promise<ProfileAddressType | undefined> => {
  try {
    const resp = await get(`${MsUrl.utils}/profile-address-entity/${id}`);
    if (resp?.data) return resp.data;
  } catch (error: any) {
    ShowToast(error?.message || ConstKeys.WENT_WRONG, 'warning');
  }
  return undefined;
};
