import { ShowToast } from "shared-lib-web";
import { useSignals } from '@preact/signals-react/runtime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { generateRandomPassword } from "../hooks/password";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import { getDefaultProfile, profileInitValues } from '../hooks/data';
import { SelectedProfile, editModeUpdate, profileSelectedId } from '../hooks/service';
import { profileHashSaveCall, profileSaveCall, profileSaveIsLoading } from '../hooks/service-http';
import {
  addressTypeOptions,
  countryOptions,
  providerOptions,
  roleOptions,
  telCodeOptions,
} from '../hooks/service-load';
import type { ProfileType } from '../hooks/types';
import { profileValidation } from '../hooks/validation';

export function useProfileForm() {
  useSignals();
  const { t } = useProfileTranslation();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const selectedProfileId = profileSelectedId.value;
  const isEdit = !!selectedProfileId;
  const selectedProfile = SelectedProfile.value;
  const roleOpts = roleOptions.value;
  const saveIsLoading = profileSaveIsLoading.value;

  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    isReset?: boolean;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const initialData = useMemo(() => {
    const base = selectedProfile || getDefaultProfile();
    return {
      ...base,
      roles: Array.isArray(base.roles)
        ? base.roles
        : base.roles
        ? [base.roles]
        : ['ADMIN_ADMIN'],
    };
  }, [selectedProfile]);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ProfileType>({
    defaultValues: initialData,
  });

  const currentProvider = watch('provider');
  const isPasswordProvider = !currentProvider || currentProvider === 'password';

  useEffect(() => {
    if (selectedProfile) {
      const rolesArr = Array.isArray(selectedProfile.roles)
        ? selectedProfile.roles
        : selectedProfile.roles
        ? [selectedProfile.roles]
        : ['ADMIN_ADMIN'];
      reset({
        ...selectedProfile,
        roles: rolesArr,
      });
    } else {
      reset({
        ...getDefaultProfile(),
        roles: ['ADMIN_ADMIN'],
      });
    }
  }, [selectedProfile, reset]);

  const onCancel = () => {
    editModeUpdate(undefined);
  };

  const copyToClipboard = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleContinue = () => {
    const wasReset = createdCredentials?.isReset;
    setCreatedCredentials(null);
    if (!wasReset) {
      editModeUpdate(undefined);
    }
  };

  const onResetPassword = async () => {
    const targetId = selectedProfileId || watch('id');
    const targetEmail = watch('email') || selectedProfile?.email || '';
    if (!targetId) return;

    try {
      setIsResettingPassword(true);
      const plainPassword = generateRandomPassword(12);
      const resp = await profileHashSaveCall({
        id: targetId,
        provider: 'password',
        password: plainPassword,
      });

      if (resp) {
        ShowToast(t('passwordResetSuccess', 'Password reset successfully'), 'success');
        setCreatedCredentials({
          email: targetEmail,
          password: plainPassword,
          isReset: true,
        });
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onNext = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();
      const fieldsToValidate: (keyof ProfileType)[] = ['name', 'email', 'telCode', 'mobile', 'persona', 'roles'];
      const valid = await trigger(fieldsToValidate);
      if (valid) {
        clearErrors();
        setCurrentStep(2);
      }
    },
    [trigger, clearErrors]
  );

  const onPrev = () => {
    clearErrors();
    setCurrentStep(1);
  };

  const onTabClick = async (step: 1 | 2) => {
    if (step === 2 && currentStep === 1) {
      await onNext();
    } else {
      clearErrors();
      setCurrentStep(step);
    }
  };

  const onSubmit = async (data: ProfileType) => {
    if (!isEdit) {
      // 1. Auto generate 12-char random password
      const plainPassword = generateRandomPassword(12);
      // 2. Save profile entity
      const payload: ProfileType = {
        ...data,
        password: undefined,
        roles: Array.isArray(data.roles) ? data.roles : data.roles ? [data.roles] : ['ADMIN_ADMIN'],
      };
      const saved = await profileSaveCall(payload);
      if (!saved) return;

      const profileId = (saved?.data as any)?.id || data.id;

      // 3. Save profile hash
      const hashSaved = await profileHashSaveCall({
        id: profileId,
        provider: 'password',
        password: plainPassword,
      });
      if (!hashSaved) return;

      // 4. Show credentials popup
      setCreatedCredentials({
        email: data.email,
        password: plainPassword,
        isReset: false,
      });
    } else {
      const payload: ProfileType = {
        ...data,
        password: undefined,
        roles: Array.isArray(data.roles) ? data.roles : data.roles ? [data.roles] : ['ADMIN_ADMIN'],
      };
      const saved = await profileSaveCall(payload);
      if (saved) {
        editModeUpdate(undefined);
      }
    }
  };

  const onError = (formErrors: Record<string, unknown>) => {
    const step1Fields = [
      'name',
      'email',
      'telCode',
      'mobile',
      'nameLang',
      'persona',
      'roles',
      'provider',
      'active',
    ];
    const hasStep1Errors = Object.keys(formErrors).some((key) => step1Fields.includes(key));
    if (hasStep1Errors) {
      setCurrentStep(1);
    } else {
      setCurrentStep(2);
    }
  };

  // ─── Step 1 Props: Identity & Contact ────────────────────────────────────
  const nameProps = useMemo(
    () => ({
      control,
      name: 'name' as const,
      label: t('fullName'),
      placeholder: t('fullNamePlaceholder'),
      rules: profileValidation.name,
      error: errors.name,
      className: 'w-full',
    }),
    [t, control, errors.name]
  );

  const emailProps = useMemo(
    () => ({
      control,
      name: 'email' as const,
      label: t('emailAddress'),
      placeholder: t('emailPlaceholder'),
      type: 'email',
      rules: profileValidation.email,
      error: errors.email,
      className: 'w-full',
    }),
    [t, control, errors.email]
  );

  const telCodeProps = useMemo(
    () => ({
      control,
      name: 'telCode' as const,
      label: t('countryCode'),
      options: telCodeOptions.value,
      rules: profileValidation.telCode,
      error: errors.telCode,
      className: 'w-40 sm:w-44 shrink-0',
    }),
    [t, control, errors.telCode]
  );

  const mobileProps = useMemo(
    () => ({
      control,
      name: 'mobile' as const,
      label: t('mobileNumber'),
      placeholder: t('mobilePlaceholder'),
      type: 'tel',
      rules: profileValidation.mobile,
      error: errors.mobile,
      className: 'w-full flex-1',
    }),
    [t, control, errors.mobile]
  );

  const rolesProps = useMemo(
    () => ({
      control,
      name: 'roles' as const,
      label: t('assignedRoles'),
      placeholder: t('selectRoles', t('selectRole', 'Select Roles')),
      options: roleOpts.map((role) => ({
        key: role.value || role.key,
        label: role.label,
      })),
      rules: profileValidation.roles,
      error: errors.roles as FieldError | undefined,
      className: 'w-full',
    }),
    [t, control, roleOpts, errors.roles, setValue]
  );

  const selectedRoles = watch("roles");
  useEffect(() => {
    const firstWithPersona = roleOpts.find(
      (role) =>
        Array.isArray(selectedRoles) &&
        selectedRoles.includes(role.value || role.key) &&
        role.persona,
    );
    if (firstWithPersona?.persona) {
      setValue("persona", firstWithPersona.persona);
    }
  }, [roleOpts, selectedRoles, setValue]);

  const providerProps = useMemo(
    () => ({
      control,
      name: 'provider' as const,
      label: t('authProvider'),
      options: providerOptions.value.map((option) => ({
        key: option.value,
        label: option.label,
      })),
      className: 'w-full',
      disabled: true,
    }),
    [t, control]
  );

  const passwordProps = useMemo(
    () => ({
      control,
      name: 'password' as const,
      label: t('password'),
      placeholder: t('enterPassword'),
      type: 'password',
      rules: !isEdit && isPasswordProvider ? profileValidation.password : undefined,
      error: errors.password,
      className: 'w-full',
    }),
    [t, control, errors.password, isEdit, isPasswordProvider]
  );

  const activeProps = useMemo(
    () => ({
      control,
      name: 'active' as const,
      label: t('activeAccount'),
      className: 'w-full',
    }),
    [t, control]
  );

  // ─── Step 2 Props: Address Details ───────────────────────────────────────
  const addressTypeProps = useMemo(
    () => ({
      control,
      name: 'addressType' as const,
      label: t('addressType'),
      options: addressTypeOptions.value.map((option) => ({
        key: option.value,
        label: option.label,
      })),
      rules: profileValidation.addressType,
      error: errors.addressType,
      className: 'w-full',
    }),
    [t, control, errors.addressType]
  );

  const streetAddressProps = useMemo(
    () => ({
      control,
      name: 'streetAddress' as const,
      label: t('streetAddress'),
      placeholder: t('streetAddressPlaceholder'),
      rules: profileValidation.streetAddress,
      error: errors.streetAddress,
      className: 'w-full',
    }),
    [t, control, errors.streetAddress]
  );

  const suiteProps = useMemo(
    () => ({
      control,
      name: 'suite' as const,
      label: t('suiteAptUnit'),
      placeholder: t('suitePlaceholder'),
      className: 'w-full',
    }),
    [t, control]
  );

  const cityProps = useMemo(
    () => ({
      control,
      name: 'city' as const,
      label: t('city'),
      placeholder: t('cityPlaceholder'),
      rules: profileValidation.city,
      error: errors.city,
      className: 'w-full',
    }),
    [t, control, errors.city]
  );

  const stateProps = useMemo(
    () => ({
      control,
      name: 'state' as const,
      label: t('stateProvince'),
      placeholder: t('statePlaceholder'),
      rules: profileValidation.state,
      error: errors.state,
      className: 'w-full',
    }),
    [t, control, errors.state]
  );

  const postalCodeProps = useMemo(
    () => ({
      control,
      name: 'postalCode' as const,
      label: t('postalZipCode'),
      placeholder: t('postalPlaceholder'),
      rules: profileValidation.postalCode,
      error: errors.postalCode,
      className: 'w-full',
    }),
    [t, control, errors.postalCode]
  );

  const countryProps = useMemo(
    () => ({
      control,
      name: 'country' as const,
      label: t('country'),
      options: countryOptions.value.map((option) => ({
        key: option.value,
        label: option.label,
      })),
      rules: profileValidation.country,
      error: errors.country,
      className: 'w-full',
    }),
    [t, control, errors.country]
  );

  // ─── Button Props ────────────────────────────────────────────────────────
  const cancelProps = useMemo(
    () => ({
      action: 'secondary' as const,
      label: t('cancel'),
      icon: 'X' as const,
      onPress: onCancel,
      type: 'button' as const,
    }),
    [t]
  );

  const nextProps = useMemo(
    () => ({
      action: 'primary' as const,
      label: t('next', 'Next'),
      icon: 'ChevronRight' as const,
      onPress: onNext,
      type: 'button' as const,
      className: 'btn-sm bg-primary hover:bg-primary-focus text-primary-content',
    }),
    [t, onNext]
  );

  const prevProps = useMemo(
    () => ({
      action: 'secondary' as const,
      label: t('back'),
      icon: 'ChevronLeft' as const,
      onPress: onPrev,
      type: 'button' as const,
      className: 'btn-ghost btn-sm',
    }),
    [t]
  );

  const onSave = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      handleSubmit(onSubmit, onError)();
    },
    [handleSubmit, onSubmit, onError]
  );

  const saveProps = useMemo(
    () => ({
      action: 'primary' as const,
      label: isEdit ? t('update', 'Update') : t('create', 'Create'),
      icon: 'Save' as const,
      type: 'submit' as const,
      onPress: onSave,
      isLoading: saveIsLoading,
      className: 'btn-sm bg-primary hover:bg-primary-focus text-primary-content',
    }),
    [t, isEdit, saveIsLoading, onSave]
  );

  const resetPasswordProps = useMemo(
    () => ({
      action: 'secondary' as const,
      label: t('resetPassword', 'Reset Password'),
      icon: 'KeyRound' as const,
      onPress: onResetPassword,
      type: 'button' as const,
      isLoading: isResettingPassword,
      disabled: isResettingPassword,
      className: 'btn-sm border-base-300 hover:bg-base-300/60',
    }),
    [t, onResetPassword, isResettingPassword]
  );

  const closeIconButtonProps = useMemo(
    () => ({
      action: 'ghost' as const,
      label: t('close'),
      icon: 'X' as const,
      isIconOnly: true,
      onPress: cancelProps.onPress,
      className: 'btn-circle opacity-70 hover:opacity-100 hover:bg-base-200',
    }),
    [cancelProps.onPress, t]
  );

  const identityTabProps = useMemo(
    () => ({
      action: 'ghost' as const,
      label: `1 ${t('identityContact')}`,
      onPress: () => void onTabClick(1),
      className: `flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
        currentStep === 1
          ? 'bg-base-100 text-primary shadow-xs border border-base-300'
          : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
      }`,
    }),
    [currentStep, onTabClick, t]
  );

  const addressTabProps = useMemo(
    () => ({
      action: 'ghost' as const,
      label: `2 ${t('addressDetails')}`,
      onPress: () => void onTabClick(2),
      className: `flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${
        currentStep === 2
          ? 'bg-base-100 text-primary shadow-xs border border-base-300'
          : 'text-base-content/60 hover:text-base-content hover:bg-base-300/50'
      }`,
    }),
    [currentStep, onTabClick, t]
  );

  const copyEmailButtonProps = useMemo(
    () => ({
      action: 'ghost' as const,
      label: t('copyEmail', 'Copy email'),
      icon: copiedField === 'email' ? 'Check' as const : 'Copy' as const,
      isIconOnly: true,
      onPress: () => copyToClipboard(createdCredentials?.email || '', 'email'),
      className: 'btn-square text-base-content/70 hover:text-primary',
    }),
    [copiedField, copyToClipboard, createdCredentials?.email, t]
  );

  const togglePasswordButtonProps = useMemo(
    () => ({
      action: 'ghost' as const,
      label: showPassword
        ? t('hidePassword', 'Hide password')
        : t('showPassword', 'Show password'),
      icon: showPassword ? 'EyeOff' as const : 'Eye' as const,
      isIconOnly: true,
      onPress: () => setShowPassword((value) => !value),
      className: 'btn-square text-base-content/70 hover:text-primary',
    }),
    [setShowPassword, showPassword, t]
  );

  const copyPasswordButtonProps = useMemo(
    () => ({
      action: 'ghost' as const,
      label: t('copyPassword', 'Copy password'),
      icon: copiedField === 'password' ? 'Check' as const : 'Copy' as const,
      isIconOnly: true,
      onPress: () => copyToClipboard(createdCredentials?.password || '', 'password'),
      className: 'btn-square text-base-content/70 hover:text-primary',
    }),
    [copiedField, copyToClipboard, createdCredentials?.password, t]
  );

  const continueButtonProps = useMemo(
    () => ({
      action: 'primary' as const,
      label: t('continue', 'Continue'),
      icon: 'ArrowRight' as const,
      onPress: handleContinue,
      className: 'w-full gap-2 shadow-sm text-primary-content',
    }),
    [handleContinue, t]
  );

  return {
    control,
    currentStep,
    setCurrentStep,
    onTabClick,
    onNext,
    onPrev,
    clearErrors,
    isEdit,
    handleSubmit,
    onSubmit,
    onError,
    defaultValues: profileInitValues,
    // Step 1
    nameProps,
    emailProps,
    telCodeProps,
    mobileProps,
    rolesProps,
    providerProps,
    passwordProps,
    isPasswordProvider,
    activeProps,
    // Step 2
    addressTypeProps,
    streetAddressProps,
    suiteProps,
    cityProps,
    stateProps,
    postalCodeProps,
    countryProps,
    // Buttons
    cancelProps,
    nextProps,
    prevProps,
    saveProps,
    resetPasswordProps,
    closeIconButtonProps,
    identityTabProps,
    addressTabProps,
    copyEmailButtonProps,
    togglePasswordButtonProps,
    copyPasswordButtonProps,
    continueButtonProps,
    isResettingPassword,
    // Credentials popup
    createdCredentials,
    copiedField,
    showPassword,
    setShowPassword,
    copyToClipboard,
    handleContinue,
  };
}
