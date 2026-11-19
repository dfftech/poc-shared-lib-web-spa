'use client';

import { ContentLayout, TypeButton, TypeCheckbox, TypeDrawer, TypeInput, TypeSelect } from 'shared-lib-web';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import { useRoleAddInline, type RoleAddInlineProps } from './role-add-inline.ts';

export type { RoleAddInlineProps };

export function RoleAddInline(props: RoleAddInlineProps) {
  const { t } = useTranslation();
  const {
    isOpen,
    isEdit,
    handleSubmit,
    nameProps,
    cloneProps,
    activeProps,
    submitButtonProps,
    onClose,
    closeButtonProps,
  } = useRoleAddInline(props);

  return (
    <TypeDrawer isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-base-100 flex justify-between items-center mb-4 pb-2 border-b border-base-300">
          <div>
            <h2 className="text-lg font-bold text-base-content">
              {t('nav.roles')}
            </h2>
            {!isEdit && (
              <p className="text-xs text-base-content/60 mt-1">{t('addNewRoleSubtitle')}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TypeButton {...submitButtonProps} />
            <TypeButton {...closeButtonProps} />
          </div>
        </div>

        <ContentLayout>
          <div className="flex-1 p-2 space-y-4 overflow-y-auto">
            <TypeInput {...nameProps} />
            {!isEdit && <TypeSelect {...cloneProps} />}
            <TypeCheckbox {...activeProps} />
          </div>
        </ContentLayout>
      </form>
    </TypeDrawer>
  );
}

export default RoleAddInline;
