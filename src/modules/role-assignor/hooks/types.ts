export interface RoleItem {
  id: string;
  key?: string;
  value?: string;
  name: string;
  label?: string;
  persona?: string;
  active?: boolean;
  profileCount?: number;
}

export interface ProfileType {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  telCode?: string;
  persona?: string;
  roles?: string[];
  active?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
