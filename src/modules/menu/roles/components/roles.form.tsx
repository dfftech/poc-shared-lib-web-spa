'use client';

import React from 'react';
import { useTranslation } from '../../hooks/use-menu-translation.ts';
import { ContentLayout, HeadLayout, TypeButton, TypeCheckbox, TypeInput, TypeSelect } from 'shared-lib-web';
import { useRolesForm } from './roles.form.ts';

export function RolesForm() {
  const { t } = useTranslation();
  const {
    isEdit,
    handleSubmit,
    nameProps,
    cloneProps,
    activeProps,
    submitButtonProps,
    cancelProps,
  } = useRolesForm();

  return (
    <section className="w-full">
      <HeadLayout
        title={t('nav.roles')}
        actions={<TypeButton {...cancelProps} />}
      />

      <form onSubmit={handleSubmit}>
        <ContentLayout>
          <div className="flex flex-col gap-4 py-2">
            <TypeInput {...nameProps} />
            {!isEdit && <TypeSelect {...cloneProps} />}
            <TypeCheckbox {...activeProps} />
          </div>
        </ContentLayout>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-base-300">
          <TypeButton {...cancelProps} />
          <TypeButton {...submitButtonProps} />
        </div>
      </form>
    </section>
  );
}

export default RolesForm;
