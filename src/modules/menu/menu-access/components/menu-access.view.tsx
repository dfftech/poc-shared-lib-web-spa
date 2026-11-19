'use client';

import { TypeIcon, resolveLucideIcon } from 'shared-lib-web';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import { useMenuAccessView, type MenuAccessViewProps } from './menu-access.view.ts';

export function MenuAccessView(props: MenuAccessViewProps) {
  const { t } = useTranslation();
  const { data, selectedRoleName, hasData } = useMenuAccessView(props);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-32 text-base-content/40">
        {t('noMenuAccess')}
      </div>
    );
  }

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-bold text-base-content mb-4">
        {t('accessSummaryFor')} <span className="text-primary">{selectedRoleName}</span>
      </h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.id} className="p-3 bg-base-200/50 rounded-lg border border-base-300">
            <div className="font-semibold text-base-content flex items-center gap-2">
              <TypeIcon name={resolveLucideIcon(item.icon)} size={18} />
              {item.name}
            </div>
            {item.children && (
              <div className="pl-4 mt-2 space-y-1">
                {item.children.map((child) => (
                  <div key={child.id} className="text-sm text-base-content/80 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TypeIcon
                        name={resolveLucideIcon(child.icon)}
                        size={16}
                        className="text-base-content/60"
                      />
                      {child.name}
                    </span>
                    <span className="text-xs text-base-content/60">{child.href}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuAccessView;
