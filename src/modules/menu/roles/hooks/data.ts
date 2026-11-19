import type { MenuRole } from './types';
import { personaSignal } from '../../hooks/menu-context.ts';

export const roleInitValues: MenuRole = {
  id: '',
  name: '',
  persona: personaSignal.value,
  active: true,
  nameLang: { 'en-US': '' },
};

export const getDefaultRole = (): MenuRole => ({
  ...roleInitValues,
  nameLang: { 'en-US': '' },
});
