import {
  ContentLayout,
  HeadLayout,
  TypeButton,
  TypeInput,
  TypeList,
  TypeSelect,
  TypeSwitch,
} from "shared-lib-web";
import { AlertCircle, CheckCircle2, MapPin, User } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Controller } from "react-hook-form";
import { useProfileTranslation } from "../hooks/use-profile-translation";
import { SUPPORTED_COUNTRY_ITEMS } from "../hooks/data";
import type { CountryDialItem } from "../hooks/types";
import { useProfileForm } from "./profile.form.ts";

export { SUPPORTED_COUNTRY_ITEMS };
export type { CountryDialItem };

export interface CountryCodeSelectProps {
  value?: string;
  onChange: (dialCode: string) => void;
  className?: string;
  disabled?: boolean;
}

function CountryOptionButton({
  item,
  isSelected,
  onSelect,
}: {
  item: CountryDialItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const countryButtonProps = useMemo(
    () => ({
      action: "ghost" as const,
      label: `${item.flag} ${item.name} (${item.dialCode})`,
      icon: isSelected ? "Check" as const : undefined,
      onPress: onSelect,
      className: `w-full justify-start !rounded-xl text-xs font-medium ${
        isSelected
          ? "!bg-primary/15 !text-primary hover:!bg-primary/25"
          : "!bg-transparent !text-base-content hover:!bg-base-200"
      }`,
    }),
    [isSelected, item, onSelect],
  );

  return (
    <TypeButton {...countryButtonProps} />
  );
}

export function CountryCodeSelect({
  value = "+1",
  onChange,
  className = "",
  disabled = false,
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIso, setSelectedIso] = useState<string>(() => {
    const raw = String(value || "")
      .trim()
      .toUpperCase();
    return raw === "US" ? "US" : "CA";
  });
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    const raw = String(value || "")
      .trim()
      .toUpperCase();
    if (raw === "US" || raw === "CA") {
      setSelectedIso(raw);
    }
  }

  const buttonRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const selectedItem = useMemo(() => {
    return (
      SUPPORTED_COUNTRY_ITEMS.find((c) => c.iso === selectedIso) ||
      SUPPORTED_COUNTRY_ITEMS[0]
    );
  }, [selectedIso]);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 6,
      left: rect.left,
      minWidth: Math.max(rect.width, 190),
    });
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  }, [disabled, isOpen, updatePosition]);

  const triggerButtonProps = useMemo(
    () => ({
      action: "ghost" as const,
      type: "button" as const,
      label: `${selectedItem.flag} ${selectedItem.dialCode}`,
      icon: "ChevronDown" as const,
      disabled,
      onPress: handleToggle,
      className:
        "flex items-center gap-1.5 px-3 py-2 !bg-base-200 hover:!bg-base-300 !text-base-content border-r border-base-300 shrink-0 !rounded-l-xl !rounded-r-none h-full min-h-[38px] !border-y-0 !border-l-0 !shadow-none font-normal",
    }),
    [disabled, handleToggle, selectedItem],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleReposition = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updatePosition]);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Trigger Button: Flag + Code + Arrow snugly grouped via TypeButton */}
      <div ref={buttonRef} className="h-full">
        <TypeButton {...triggerButtonProps} />
      </div>

      {/* Floating Dropdown via Portal to document.body so it NEVER renders inside input container */}
      {isOpen &&
        coords &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              minWidth: `${coords.minWidth}px`,
            }}
            className="w-56 rounded-2xl bg-base-100 border border-base-300 shadow-2xl p-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-100 text-base-content"
          >
            {SUPPORTED_COUNTRY_ITEMS.map((item) => (
              <CountryOptionButton
                key={item.iso}
                item={item}
                isSelected={item.iso === selectedItem.iso}
                onSelect={() => {
                  setSelectedIso(item.iso);
                  onChange(item.dialCode);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

export function ProfileForm() {
  const { t } = useProfileTranslation();
  const {
    control,
    currentStep,
    onNext,
    isEdit,
    handleSubmit,
    onSubmit,
    onError,
    nameProps,
    emailProps,
    mobileProps,
    rolesProps,
    activeProps,
    addressTypeProps,
    streetAddressProps,
    suiteProps,
    cityProps,
    stateProps,
    postalCodeProps,
    countryProps,
    nextProps,
    saveProps,
    resetPasswordProps,
    closeIconButtonProps,
    identityTabProps,
    addressTabProps,
    copyEmailButtonProps,
    togglePasswordButtonProps,
    copyPasswordButtonProps,
    continueButtonProps,
    createdCredentials,
    showPassword,
  } = useProfileForm();

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 1) {
            onNext();
          } else {
            handleSubmit(onSubmit, onError)(e);
          }
        }}
        className="w-full flex flex-col h-full"
      >
        <HeadLayout
          title={isEdit ? t("user.editTitle") : t("user.addTitle")}
          actions={
            <>
              {currentStep === 1 ? (
                <TypeButton key="step1-next-btn" {...nextProps} />
              ) : (
                <TypeButton key="step2-save-btn" {...saveProps} />
              )}
              <TypeButton {...closeIconButtonProps} />
            </>
          }
        />

        <ContentLayout className="flex-1 overflow-y-auto pr-1 mt-6">
          <div className="mb-4 flex items-center gap-2 p-1 rounded-xl bg-base-200 border border-base-300">
            <TypeButton {...identityTabProps} />

            <TypeButton {...addressTabProps} />
          </div>
          {currentStep === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/70 pb-1.5 border-b border-base-300">
                <User size={14} className="text-primary" />
                <span>{t("identityCredentials")}</span>
              </div>

              <TypeInput {...nameProps} />
              <TypeInput {...emailProps} />

              <div className="w-full">
                <label className="label" htmlFor="field-mobile">
                  <span className="label-text font-medium">
                    {mobileProps.label}
                    {mobileProps.rules?.required && (
                      <span className="text-error ml-0.5">*</span>
                    )}
                  </span>
                </label>
                <div
                  className={`flex items-center rounded-xl border bg-base-100 relative transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary ${
                    mobileProps.error
                      ? "border-error ring-1 ring-error/30"
                      : "border-base-300 hover:border-base-content/30"
                  }`}
                >
                  <Controller
                    name="telCode"
                    control={control}
                    render={({ field }) => (
                      <CountryCodeSelect
                        value={field.value || "+1"}
                        onChange={(dialCode) => field.onChange(dialCode)}
                      />
                    )}
                  />
                  <Controller
                    name="mobile"
                    control={control}
                    rules={mobileProps.rules}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="field-mobile"
                        type="tel"
                        placeholder={mobileProps.placeholder}
                        className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-base-content placeholder:text-base-content/40 focus:outline-none min-w-0 rounded-r-xl"
                      />
                    )}
                  />
                </div>
                {mobileProps.error?.message ? (
                  <p className="mt-1 text-xs text-error">
                    {mobileProps.error.message}
                  </p>
                ) : null}
              </div>

              <TypeList {...rolesProps} />

              {isEdit && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-base-200/50 border border-base-300">
                  <TypeSwitch {...activeProps} />
                  <TypeButton {...resetPasswordProps} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/70 pb-1.5 border-b border-base-300">
                <MapPin size={14} className="text-primary" />
                <span>{t("addressLocation")}</span>
              </div>

              <TypeSelect {...addressTypeProps} />
              <TypeInput {...streetAddressProps} />
              <TypeInput {...suiteProps} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TypeInput {...cityProps} />
                <TypeInput {...stateProps} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TypeInput {...postalCodeProps} />
                <TypeSelect {...countryProps} />
              </div>
            </div>
          )}
        </ContentLayout>
      </form>

      {/* Credentials Popup Modal */}
      {createdCredentials && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="card bg-base-100 border border-base-300 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 text-base-content rounded-3xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center text-success shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-base-content">
                  {createdCredentials.isReset
                    ? t(
                        "passwordResetSuccessTitle",
                        "Password Reset Successfully!",
                      )
                    : t(
                        "profileCreatedSuccess",
                        "Profile Created Successfully!",
                      )}
                </h3>
                <p className="text-xs text-base-content/70 max-w-sm">
                  {createdCredentials.isReset
                    ? t(
                        "passwordResetSubtitle",
                        "The password for this profile has been reset. Below are the new sign-in credentials:",
                      )
                    : t(
                        "profileCreatedSubtitle",
                        "The profile has been created successfully. Below are the administrator sign-in credentials:",
                      )}
                </p>
              </div>

              {/* Credentials Container */}
              <div className="rounded-2xl border border-base-300 bg-base-200/60 p-3.5 space-y-3">
                {/* Email */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-base-100 border border-base-300">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold text-base-content/60">
                      {t("loginEmail", "Sign In Email")}
                    </div>
                    <div className="text-sm font-semibold truncate text-base-content select-all">
                      {createdCredentials.email || "—"}
                    </div>
                  </div>
                  <TypeButton {...copyEmailButtonProps} />
                </div>

                {/* Password */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-base-100 border border-base-300">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-bold text-base-content/60">
                      {t("generatedPassword", "Generated Password")}
                    </div>
                    <div className="text-sm font-mono font-semibold truncate text-base-content select-all">
                      {showPassword
                        ? createdCredentials.password || "—"
                        : "••••••••••••"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TypeButton {...togglePasswordButtonProps} />
                    <TypeButton {...copyPasswordButtonProps} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs text-base-content/80">
                <AlertCircle
                  size={16}
                  className="text-warning shrink-0 mt-0.5"
                />
                <span>
                  {t(
                    "credentialsWarning",
                    "Please copy and store these credentials safely. You will need them to sign in to this account.",
                  )}
                </span>
              </div>

              <TypeButton {...continueButtonProps} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
