'use client';

import { useSignals } from '@preact/signals-react/runtime';
import { useEffect } from 'react';
import { MenuAccessList } from './components/menu-access.list.tsx';
import { applyScreenAction } from './hooks/service.ts';
import { loadRolesCall } from '../roles/hooks/service-load.ts';

export function MenuAccessPage() {
  useSignals();

  useEffect(() => {
    applyScreenAction();
    void loadRolesCall();
  }, []);

  return (
    <>
      <MenuAccessList />
    </>
  );
}
