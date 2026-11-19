import type { MenuAccessType } from './types';

export const menuAccessInitValues: MenuAccessType = {
  id: '',
  name: '',
  active: true,
  icon: '',
  type: 'ADMIN',
  module: '',
  children: [
    {
      id: '',
      name: '',
      nameLang: { 'en-US': '' },
      active: true,
      icon: '',
      module: '',
      description: '',
      priority: 0,
      href: '',
      menuId: '',
      permissions: { create: false, delete: false, read: false, update: false },
      type: 'ADMIN',
      roleId: 'ADMIN',
    },
  ],
};

export const getDefaultMenuAccess = (): MenuAccessType => ({
  ...menuAccessInitValues,
  children: [...menuAccessInitValues.children],
});
