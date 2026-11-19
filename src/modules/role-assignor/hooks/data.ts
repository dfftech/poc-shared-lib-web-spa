import { authUserSignal } from "shared-lib-web";
import type { ProfileType, RoleItem } from './types';

export const defaultRoleItem: RoleItem = {
  id: '',
  name: '',
  persona: authUserSignal.value?.persona || "admin",
  active: true,
};

export const defaultProfile: ProfileType = {
  id: '',
  name: '',
  email: '',
  mobile: '',
  roles: [],
  active: true,
};
