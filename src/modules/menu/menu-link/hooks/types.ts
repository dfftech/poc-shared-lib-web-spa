import type { IconName } from 'shared-lib-web';

export interface MenuGroupItem {
  id: string;
  name: string;
  nameLang?: Record<string, string>;
  icon?: string;
  active: boolean;
  priority?: number;
  persona?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuLinkItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  active: boolean;
  menuGroupId: string;
  menuGroup?: MenuGroupItem;
  nameLang?: Record<string, string>;
  priority?: number;
  persona?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuGroupWithLinksItem extends MenuGroupItem {
  links: MenuLinkItem[];
}

export interface MenuGroupsWithLinksResponse {
  data: MenuGroupWithLinksItem[];
  total: number;
}

export type MenuDrawerMode = 'create-group' | 'edit-group' | 'create-link' | 'edit-link';

export interface SubMenuItem {
  id: string;
  name: string;
  path: string;
  menuGroupId: string;
  priority?: number;
  active?: boolean;
  persona?: string;
  icon?: string;
  nameLang?: Record<string, string>;
}

export interface MenuItem {
  id: string;
  name: string;
  icon: IconName;
  subMenuCount: number;
  subMenus: SubMenuItem[];
  nameLang?: Record<string, string>;
  priority?: number;
  active?: boolean;
  persona?: string;
  /**
   * Set when this parent row is really a link promoted from ADMIN_ROOT's children.
   * Such rows are edited as links (menu-link-save), not as groups (menu-group-save).
   */
  link?: SubMenuItem;
}

export interface MenuLinkFormData {
  id?: string;
  name: string;
  nameLang?: Record<string, string>;
  icon?: string;
  href?: string;
  priority?: number;
  active: boolean;
  menuGroupId?: string;
  persona: string;
}

export interface MenuAccessItem {
  id: string;
  menuLinkId: string;
  menuRoleId: string;
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  menuLink: MenuLinkItem;
  menuRole: {
    id: string;
    name: string;
    nameLang?: Record<string, string>;
  };
}

export interface MenuAccessResponse {
  data: MenuAccessItem[];
  total: number;
}

export interface TransformedMenuAccessType {
  id?: string;
  menuId?: string;
  name: string;
  nameLang?: Record<string, string>;
  href?: string;
  icon?: IconName;
  permissions?: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  children?: TransformedMenuAccessType[];
  priority?: number;
  type?: string;
  active?: boolean;
}

export interface MenuRole {
  id: string;
  name: string;
  persona: string;
  active: boolean;
  nameLang?: Record<string, string>;
}

export interface MenuRoleResponse {
  data: MenuRole[];
  total: number;
}
