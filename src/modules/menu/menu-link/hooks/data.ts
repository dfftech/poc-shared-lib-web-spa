import { personaSignal } from '../../hooks/menu-context.ts';
import type { MenuGroupItem, MenuLinkFormData, MenuLinkItem } from './types';

export const menuGroupInitValues: MenuGroupItem = {
  id: '',
  name: '',
  icon: '',
  active: true,
  priority: 0,
  persona: personaSignal.value,
  nameLang: { 'en-US': '' },
};

export const menuLinkInitValues: MenuLinkItem = {
  id: '',
  name: '',
  href: '',
  icon: '',
  active: true,
  menuGroupId: 'ROOT',
  priority: 0,
  persona: personaSignal.value,
  nameLang: { 'en-US': '' },
};

export const menuLinkFormDataInitValues: MenuLinkFormData = {
  name: '',
  icon: '',
  href: '',
  priority: 0,
  active: true,
  menuGroupId: 'ROOT',
  persona: personaSignal.value,
};

export const getDefaultMenuGroup = (): MenuGroupItem => ({
  ...menuGroupInitValues,
  nameLang: { 'en-US': '' },
});

export const getDefaultMenuLink = (): MenuLinkItem => ({
  ...menuLinkInitValues,
  nameLang: { 'en-US': '' },
});

export const getDefaultMenuLinkForm = (): MenuLinkFormData => ({
  ...menuLinkFormDataInitValues,
});
