import type { TranslateFunction } from 'shared-lib-web';

export const menuAccessColumnDefs = (t: TranslateFunction) => [
  { field: 'name', headerName: t('feature'), flex: 1 },
  { field: 'read', headerName: t('view'), width: 100 },
  { field: 'create', headerName: t('create'), width: 100 },
  { field: 'update', headerName: t('update'), width: 100 },
  { field: 'delete', headerName: t('delete'), width: 100 },
];
