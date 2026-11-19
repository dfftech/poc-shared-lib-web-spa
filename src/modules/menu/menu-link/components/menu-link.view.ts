import { useMemo } from 'react';
import type { MenuItem } from '../hooks/types';

export interface MenuLinkViewProps {
  menu: MenuItem | null;
}

export function useMenuLinkView({ menu }: MenuLinkViewProps) {
  const hasMenu = useMemo(() => Boolean(menu), [menu]);

  return {
    menu,
    hasMenu,
  };
}
