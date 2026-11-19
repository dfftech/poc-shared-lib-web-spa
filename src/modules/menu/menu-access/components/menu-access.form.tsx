'use client';

import { SkeletonMenu, TypeCheckbox, TypeIcon } from 'shared-lib-web';
import { useSignals } from '@preact/signals-react/runtime';
import React, { forwardRef } from 'react';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import {
    useMenuAccessForm,
    type MenuAccessFormHandle,
    type MenuAccessFormProps,
} from './menu-access.form.ts';

export type { MenuAccessFormHandle, MenuAccessFormProps };

export const MenuAccessForm = forwardRef<MenuAccessFormHandle, MenuAccessFormProps>(
  (props, ref) => {
    useSignals();
    const { t } = useTranslation();
    const {
      menuAccessData,
      isLoading,
      selectedRoleName,
      permissionCheckboxProps,
      iconProps,
    } = useMenuAccessForm(props, ref);

    return (
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-sm p-5 transition-colors">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-base-300">
          <h3 className="text-lg font-bold text-base-content">
            {t('user.role')}: <span className="text-primary">{selectedRoleName}</span>
          </h3>
        </div>

        <div className="overflow-auto">
          {isLoading ? (
            <SkeletonMenu />
          ) : (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-base-200 text-base-content/80 border-b border-base-300">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    {t('feature')}
                  </th>
                  <th
                    colSpan={4}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                  >
                    {t('accessPermissions')}
                  </th>
                </tr>
                <tr className="text-base-content/60 text-xs">
                  <th />
                  <th className="text-center py-2">{t('view')}</th>
                  <th className="text-center py-2">{t('create')}</th>
                  <th className="text-center py-2">{t('update')}</th>
                  <th className="text-center py-2">{t('delete')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-base-300 text-sm">
                {menuAccessData.map((feature) => {
                  const hasChildren = feature.children?.length;
                  const featureId = feature.id || '';

                  return (
                    <React.Fragment key={featureId}>
                      <tr className="bg-base-200/50 font-semibold text-base-content">
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-2">
                            <TypeIcon {...iconProps[featureId]} />
                            {feature.name}
                          </span>
                        </td>

                        {!hasChildren &&
                          (['get', 'create', 'update', 'delete'] as const).map((perm) => (
                            <td key={perm} className="text-center py-3.5">
                              <TypeCheckbox {...permissionCheckboxProps[`${featureId}.${perm}`]} />
                            </td>
                          ))}
                        {/* Group rows have no permission cells; span the permission columns so
                            the row background covers the full width (otherwise only the first
                            cell is painted, which shows as a half-width band in dark mode). */}
                        {hasChildren && <td colSpan={4} aria-hidden="true" />}
                      </tr>

                      {hasChildren &&
                        feature.children!.map((child) => {
                          const childId = child.id || '';
                          return (
                            <tr
                              key={childId}
                              className="hover:bg-base-200/60 transition-colors text-base-content/90"
                            >
                              <td className="px-4 py-3 pl-8 text-sm">
                                <span className="flex items-center gap-2">
                                  <TypeIcon {...iconProps[childId]} />
                                  {child.name}
                                </span>
                              </td>

                              {(['get', 'create', 'update', 'delete'] as const).map((perm) => (
                                <td key={perm} className="text-center py-3">
                                  <TypeCheckbox {...permissionCheckboxProps[`${childId}.${perm}`]} />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  },
);

MenuAccessForm.displayName = 'MenuAccessForm';

export default MenuAccessForm;
