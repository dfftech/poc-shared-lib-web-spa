'use client';

import { TypeIcon, resolveLucideIcon } from 'shared-lib-web';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import {
    useMenuLinkView,
    type MenuLinkViewProps,
} from './menu-link.view.ts';

export type { MenuLinkViewProps };

export function MenuLinkView(props: MenuLinkViewProps) {
  const { t } = useTranslation();
  const { menu, hasMenu } = useMenuLinkView(props);

  if (!hasMenu || !menu) {
    return (
      <div className="flex items-center justify-center h-32 text-base-content/40">
        {t('selectMenuToView')}
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <TypeIcon name={resolveLucideIcon(menu.icon)} size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-base-content">{menu.name}</h3>
          <p className="text-sm text-base-content/60">
            {t('subMenusCount', { count: menu.subMenuCount })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-base-200 border border-base-300 rounded-lg p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wide mb-1">
            {t('priority')}
          </p>
          <p className="font-bold text-base-content">
            {menu.priority ?? '—'}
          </p>
        </div>

        <div className="bg-base-200 border border-base-300 rounded-lg p-4">
          <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wide mb-1">
            {t('status')}
          </p>
          <div className="mt-1">
            {menu.active ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                {t('active')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-base-300 text-base-content/80 border border-base-300">
                <span className="w-1.5 h-1.5 rounded-full bg-base-content/40"></span>
                {t('inactive')}
              </span>
            )}
          </div>
        </div>

        {menu.persona && (
          <div className="bg-base-200 border border-base-300 rounded-lg p-4 sm:col-span-2">
            <p className="text-xs text-base-content/60 uppercase font-semibold tracking-wide mb-1">
              {t('persona')}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 capitalize">
              {menu.persona}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
