'use client';

import { ContentLayout, TypeButton, TypeDrawer, TypeInput, TypeLang, TypeSelect, TypeSwitch } from 'shared-lib-web';
import { Info } from 'lucide-react';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import { useMenuLinkForm, type MenuDrawerMode, type MenuLinkFormProps } from './menu-link.form.ts';

export type { MenuDrawerMode, MenuLinkFormProps };

export function MenuLinkForm(props: MenuLinkFormProps) {
  const { t } = useTranslation();
  const {
    isOpen,
    drawerTitle,
    isGroupMode,
    handleSubmit,
    nameLangProps,
    iconProps,
    hrefProps,
    menuGroupIdProps,
    priorityProps,
    activeProps,
    submitButtonProps,
    closeButtonProps,
  } = useMenuLinkForm(props);

  return (
    <TypeDrawer isOpen={isOpen} onClose={closeButtonProps.onPress}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-base-100 flex justify-between items-center mb-4 pb-2 border-b border-base-300">
          <div>
            <h2 className="text-lg font-bold text-base-content">{drawerTitle}</h2>
            <p className="text-xs text-base-content/60 mt-1">
              {isGroupMode ? t('menuGroupSubtitle') : t('menuLinkSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TypeButton {...submitButtonProps} />
            <TypeButton {...closeButtonProps} />
          </div>
        </div>

        <ContentLayout>
          <div className="flex-1 p-2 space-y-4 overflow-y-auto">
            {/* Multi-language name with auto-translate to French & Spanish, for groups and links. */}
            <TypeLang {...nameLangProps} />

            <div className="form-control w-full">
              <label className="label flex items-center gap-1.5">
                <span className="label-text font-medium">
                  {t('lucideIconName')}
                  <span className="text-error ml-1">*</span>
                </span>
                <span
                  className="tooltip tooltip-right inline-flex align-middle text-base-content/50 hover:text-base-content"
                  data-tip={t('lucideIconHint')}
                >
                  <Info size={14} aria-label={t('lucideIconHint')} />
                </span>
              </label>
              <TypeInput {...iconProps} />
            </div>

            {!isGroupMode && (
              <>
                <TypeInput {...hrefProps} />
                <TypeSelect {...menuGroupIdProps} />
              </>
            )}

            <TypeInput {...priorityProps} />
            <TypeSwitch {...activeProps} />
          </div>
        </ContentLayout>
      </form>
    </TypeDrawer>
  );
}

export default MenuLinkForm;
