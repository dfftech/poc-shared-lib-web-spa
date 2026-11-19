import { useMemo } from 'react';
import type { TransformedMenuAccessType } from '../hooks/types';

export interface MenuAccessViewProps {
  data: TransformedMenuAccessType[];
  selectedRoleName: string;
}

export function useMenuAccessView(props: MenuAccessViewProps) {
  const hasData = useMemo(() => Boolean(props.data && props.data.length > 0), [props.data]);

  return {
    ...props,
    hasData,
  };
}
