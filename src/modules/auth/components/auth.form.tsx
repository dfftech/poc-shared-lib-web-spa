"use client";

import { AppBrand, SettingsMenu } from "shared-lib-web";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Shield,
} from "lucide-react";
import { useAuthTranslation } from "../hooks/use-auth-translation";
import { useAuthForm } from "./auth.form.ts";

// HTML only — all logic lives in ./auth.form.ts (skill: same basename).
export function AuthForm() {
  const { t } = useAuthTranslation();
  const {
    isPending,
    view,
    setView,
    email,
    setEmail,
    password,
    setPassword,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    rememberMe,
    setRememberMe,
    error,
    setError,
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword,
    handleLogin,
    handleForgot,
    handleResetPassword,
    handleVerifyOtp,
  } = useAuthForm();

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#171a20] px-4 py-10 text-slate-100 transition-colors duration-200 sm:px-6">
      {/* Theme and language preferences */}
      <div className="absolute top-4 right-4 z-20">
        <SettingsMenu showNavigationMode={false} showLayoutChoice={false} />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#292044]/35 blur-3xl"></div>
        <div className="absolute -bottom-48 -left-40 h-96 w-96 rounded-full bg-[#322033]/35 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#20283a]/15 blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg">
        {/* Welcome Card */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.03] bg-[#1e232b] shadow-2xl shadow-black/20 transition-all duration-200">
          {/* Decorative Header Bar */}
          <div className="h-2 bg-[linear-gradient(90deg,#695cff_0%,#ed42a6_55%,#25cbb6_100%)]"></div>

          <div className="px-8 py-10">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="relative group">
                <AppBrand
                  className="justify-center rounded-lg drop-shadow-xs"
                  nameClassName="text-sm font-bold tracking-wide text-sky-400"
                />
              </div>
            </div>

            {/* Top Toolbar: Back Button & Theme Switcher */}
            <div className="mb-6 flex min-h-4 items-center justify-between gap-3">
              {view !== "login" ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("login");
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-primary"
                >
                  <ChevronLeft size={16} />
                  <span>{t("authBackToSignIn")}</span>
                </button>
              ) : (
                <span />
              )}
            </div>

            {/* Title / Description */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                {view === "login" && t("login.title")}
                {view === "forgot" && t("authForgotPassword")}
                {view === "reset" && t("authResetPassword")}
                {view === "otp" && t("authVerifyEmail")}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {view === "login" && t("login.hint")}
                {view === "forgot" && t("authForgotSubtitle")}
                {view === "reset" && t("authResetSubtitle")}
                {view === "otp" &&
                  t("authOtpSubtitle", { email: email || t("authYourEmail") })}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-error/30 bg-error/15 p-3 text-error">
                <AlertCircle className="h-5 w-5 shrink-0 text-error" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* View 1: Sign In */}
            {view === "login" && (
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    {t("login.email")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-[#151a20] bg-[#1b2027] py-3.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 group-hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="admin@botnbolt.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    {t("login.password")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-[#151a20] bg-[#1b2027] py-3.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 group-hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="checkbox checkbox-primary checkbox-sm border-slate-600"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block cursor-pointer select-none text-[11px] text-slate-400"
                    >
                      {t("login.remember")}
                    </label>
                  </div>

                  <div className="text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setView("forgot");
                      }}
                      className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:underline"
                    >
                      {t("authForgotPasswordLink")}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary min-h-10 h-10 w-full rounded-xl text-sm font-medium text-primary-content shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" />
                      {t("authSigningIn")}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      {t("login.submit")}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* View 2: Forgot Password */}
            {view === "forgot" && (
              <form className="space-y-4" onSubmit={handleForgot}>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="mb-1.5 block text-xs font-medium text-slate-200"
                  >
                    {t("login.email")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-[#151a20] bg-[#1b2027] py-2.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 transition-all duration-200 group-hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="admin@botnbolt.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary min-h-8 h-8 w-full rounded-lg text-xs font-medium text-primary-content shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin h-5 w-5 text-current" />
                  ) : (
                    <>
                      <span>{t("authSendResetCode")}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* View 3: Reset Password with OTP */}
            {view === "reset" && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <label
                    htmlFor="reset-otp"
                    className="mb-1.5 block text-xs font-medium text-slate-200"
                  >
                    {t("authVerificationCode")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="reset-otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-[#151a20] bg-[#1b2027] py-2.5 pl-9 pr-3 text-center font-mono text-lg tracking-widest text-slate-100 placeholder:text-slate-500 transition-all duration-200 group-hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-medium text-slate-200"
                  >
                    {t("authNewPassword")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-[#151a20] bg-[#1b2027] py-2.5 pl-9 pr-10 text-xs text-slate-100 placeholder:text-slate-500 transition-all duration-200 group-hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t("authPasswordHint")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 transition-colors hover:text-slate-200"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary min-h-8 h-8 w-full rounded-lg text-xs font-medium text-primary-content shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin h-5 w-5 text-current" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>{t("authUpdatePassword")}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* View 4: OTP Verification */}
            {view === "otp" && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label
                    htmlFor="login-otp"
                    className="mb-1.5 block text-xs font-medium text-slate-200"
                  >
                    {t("authEnterOtp")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-4 w-4 text-slate-500 transition-colors group-focus-within:text-primary" />
                    </div>
                    <input
                      id="login-otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isPending}
                      className="block w-full rounded-lg border border-[#151a20] bg-[#1b2027] py-2.5 pl-9 pr-3 text-center font-mono text-lg tracking-widest text-slate-100 placeholder:text-slate-500 transition-all duration-200 group-hover:border-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary min-h-8 h-8 w-full rounded-lg text-xs font-medium text-primary-content shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin h-5 w-5 text-current" />
                  ) : (
                    <>
                      <span>{t("authVerifyAndContinue")}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="rounded-full border border-white/[0.04] bg-[#1b2027] px-3 font-medium text-slate-500">
                    {t("authPlatform")}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Admin */}
            {/* <div className="mt-8 text-center">
              <span className="text-xs text-slate-400">
                {t("authNeedHelp")}{" "}
              </span>
              <a
                href="mailto:support@botnbolt.com"
                className="group inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
              >
                <Shield className="w-4 h-4" />
                {t("authContactAdmin")}
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </a>
            </div> */}
            <div className="jsx-6f489f14f2ce0296 mt-6 flex flex-wrap items-center justify-center gap-1 text-sm">
              <span className="jsx-6f489f14f2ce0296 text-base-content/60">
                {t("authNeedHelp")}{" "}
              </span>
              <a
                href="mailto:support@botnbolt.com"
                className="jsx-6f489f14f2ce0296 inline-flex items-center gap-1 font-medium text-primary hover:underline transition-colors group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-shield w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                </svg>
                {t("authContactAdmin")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-chevron-right group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.03] bg-[#1e232b]/70 px-4 py-1.5 text-slate-400 shadow-2xs backdrop-blur-sm">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-[10px]">{t("authSecureAuth")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
