import type {
  CountryType,
  FileType,
  KeyValueType,
  LanguageType,
  RequestBodyType,
  RequestByIdType,
  ResponseType,
  SearchType,
} from 'dff-util';

export interface CountryDialItem {
  dialCode: string;
  flag: string;
  name: string;
  iso: string;
}

export type OptionType = {
  label: string;
  value: string;
  key?: string;
  disabled?: boolean;
  icon?: string;
  lang?: Record<string, string>;
  persona?: string;
};

export type AddressTypeKind = 'office' | 'headquarters' | 'billing' | 'residential';

export type PersonaKind = 'admin' | 'member' | 'manager' | 'technician' | 'support' | 'contractor';

export type AddressType = {
  id?: string;
  address: string;
  area?: string;
  city: string;
  state: string;
  country: string;
  zipcode?: string;
  type: string;
  lat?: number;
  lng?: number;
};

export type ProfileAddressType = {
  profileId: string;
  addressId: string;
};

export type ProfileType = {
  // Identity & Contact Details
  id: string;
  name: string;
  nameLang?: Record<string, string> | string;
  password?: string;
  pic?: string;
  email: string;
  telCode: string;
  mobile: string;
  persona: PersonaKind | string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  roles: string[];
  active: boolean;
  provider: string;

  // Address Details
  addressId?: string;
  addressType?: AddressTypeKind;
  streetAddress?: string;
  suite?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Audit Fields
  createdAt?: Date | string;
  createdBy?: string;
  updatedAt?: Date | string;
  updatedBy?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProfileFormData = ProfileType;

export type ProfileFilterState = {
  search: string;
  status: 'all' | 'active' | 'inactive';
  persona: string;
  lang: string;
};

export interface ProfileGridProps {
  searchTerm?: string;
  statusFilter?: string;
  personaFilter?: string;
  langFilter?: string;
}

export type {
  CountryType,
  FileType,
  KeyValueType,
  LanguageType,
  RequestBodyType,
  RequestByIdType,
  ResponseType,
  SearchType
};
