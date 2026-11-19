import type { IconName } from 'shared-lib-web';
import type {
  MenuRole,
  MenuRoleResponse,
  MenuAccessItem,
  MenuAccessResponse,
  TransformedMenuAccessType,
} from '../../menu-link/hooks/types';

export type {
  MenuRole,
  MenuRoleResponse,
  MenuAccessItem,
  MenuAccessResponse,
  TransformedMenuAccessType,
};

export interface NameLang {
  en?: string;
  es?: string;
  fr?: string;
  'en-US'?: string;
}

export interface Permission {
  get: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface Permissions {
  create: boolean;
  delete: boolean;
  read: boolean;
  update: boolean;
}

export interface MenuAccessItemType {
  id?: string;
  name: string;
  nameLang?: NameLang;
  active: boolean;
  icon: string | IconName;
  module: string;
  description?: string;
  priority?: number;
  href?: string;
  menuId?: string;
  permissions?: Permissions;
  type: string;
  roleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuAccessType {
  id?: string;
  name: string;
  active: boolean;
  icon: string | IconName;
  type: string;
  module: string;
  children: MenuAccessItemType[];
}

export interface PersonaOption {
  key: string;
  value: string;
  label: string;
  active?: boolean;
}
