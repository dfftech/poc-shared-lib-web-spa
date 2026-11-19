'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { useEffect } from 'react';
import { MenuLinkList } from './components/menu-link.list.tsx';
import { applyScreenAction } from './hooks/service.ts';

export function MenuLinkPage() {
  useSignals();

  useEffect(() => {
    applyScreenAction();
  }, []);

  return (
    <>
      <MenuLinkList />
    </>
  );
}
