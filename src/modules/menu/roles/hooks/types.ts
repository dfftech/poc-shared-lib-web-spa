export interface MenuRole {
  id: string;
  name: string;
  persona: string;
  active: boolean;
  nameLang?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuRoleResponse {
  data: MenuRole[];
  total: number;
}

export interface MenuRoleFormData {
  name: string;
  persona: string;
  active: boolean;
  cloneFrom?: string;
}

export interface PersonaOption {
  key: string;
  value: string;
  label: string;
  active?: boolean;
}
