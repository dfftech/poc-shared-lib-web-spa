import type { TranslateFunction } from 'shared-lib-web';
import type { MenuItem } from '../hooks/types';

export const menuLinkColumnDefs = (t: TranslateFunction) => [
  { field: 'name', headerName: t('menuName'), flex: 1 },
  { field: 'icon', headerName: t('icon'), width: 120 },
  { field: 'priority', headerName: t('priority'), width: 100 },
  { field: 'active', headerName: t('activeStatus'), width: 100 },
];

export const formatMenuItem = (item: MenuItem) => ({
  ...item,
});
