// settings.page.ts — TypeScript only. Basic example: one language and no branches, so only theme and menu settings.
//   const { theme, t } = useUi();                     // values (re-render on change)
//   changeTheme("dark"); changeNavigationMode("megamenu"); setMenuVisible(false);
import {
  changeLayoutChoice,
  changeNavigationMode,
  changeTheme,
  isMenuVisibleSignal,
  layoutChoiceSignal,
  navigationModeSignal,
  navigationSignal,
  readDataValue,
  setMenuVisible,
  useUi,
  type LayoutChoice,
  type NavigationMode,
  type Theme,
  type TypeButtonProps,
} from "shared-lib-web";
import type { MouseEvent } from "react";
import { useMemo } from "react";

export interface SettingsModel {
  titleText: string;
  themeTitle: string;
  lightThemesTitle: string;
  darkThemesTitle: string;
  theme: Theme;
  lightThemes: Theme[];
  darkThemes: Theme[];
  layoutTitle: string;
  appLayoutText: string;
  asideLayoutText: string;
  layoutChoice: LayoutChoice;
  navigationTitle: string;
  sidebarText: string;
  megaMenuText: string;
  navigationMode: NavigationMode;
  /** false while there are no menu items: no sidebar / mega menu choice. */
  hasMenu: boolean;
  menuTitle: string;
  menuOnText: string;
  menuOffText: string;
  isMenuVisible: boolean;
  appLayoutButtonProps: TypeButtonProps;
  asideLayoutButtonProps: TypeButtonProps;
  sidebarButtonProps: TypeButtonProps;
  megaMenuButtonProps: TypeButtonProps;
  menuOnButtonProps: TypeButtonProps;
  menuOffButtonProps: TypeButtonProps;
  themeButtonProps: Record<string, TypeButtonProps>;
}

/** Theme buttons carry the theme name in data-value. */
export function handleSettingsThemeClick(event: MouseEvent<HTMLButtonElement>): void {
  const themeName = readDataValue(event);
  if (themeName) {
    changeTheme(themeName);
  }
}

/** Layout buttons carry "app" or "aside" in data-value. */
export function handleSettingsLayoutClick(event: MouseEvent<HTMLButtonElement>): void {
  const choice = readDataValue(event) as LayoutChoice;
  changeLayoutChoice(choice);
}

/** Menu mode buttons carry "sidebar" or "megamenu" in data-value. */
export function handleSettingsNavigationClick(event: MouseEvent<HTMLButtonElement>): void {
  const mode = readDataValue(event) as NavigationMode;
  changeNavigationMode(mode);
}

/** Menu buttons carry "on" or "off" in data-value: the menu is switched at runtime, no reload. */
export function handleSettingsMenuClick(event: MouseEvent<HTMLButtonElement>): void {
  const isVisible = readDataValue(event) === "on";
  setMenuVisible(isVisible);
}

export function useSettings(): SettingsModel {
  const { t, theme, lightThemes, darkThemes } = useUi();
  const layoutChoice = layoutChoiceSignal.value;
  const navigationMode = navigationModeSignal.value;
  const isMenuVisible = isMenuVisibleSignal.value;

  const appLayoutButtonProps = useMemo(
    () => ({
      action: layoutChoice === "app" ? "primary" as const : "ghost" as const,
      size: "sm" as const,
      icon: "PanelTop" as const,
      label: t("ui.appLayout"),
      className: "join-item border border-base-300",
      dataValue: "app" as const,
      onPress: handleSettingsLayoutClick,
    }),
    [layoutChoice, t],
  );

  const asideLayoutButtonProps = useMemo<TypeButtonProps>(
    () => ({
      action: layoutChoice === "aside" ? "primary" : "ghost",
      size: "sm",
      icon: "PanelLeft",
      label: t("ui.asideLayout"),
      className: "join-item border border-base-300",
      dataValue: "aside",
      onPress: handleSettingsLayoutClick,
    }),
    [layoutChoice, t],
  );
  const sidebarButtonProps = useMemo<TypeButtonProps>(
    () => ({
      action: navigationMode === "sidebar" ? "primary" : "ghost",
      size: "sm",
      icon: "PanelLeft",
      label: t("settings.sidebar"),
      className: "join-item border border-base-300",
      dataValue: "sidebar",
      onPress: handleSettingsNavigationClick,
    }),
    [navigationMode, t],
  );
  const megaMenuButtonProps = useMemo<TypeButtonProps>(
    () => ({
      action: navigationMode === "megamenu" ? "primary" : "ghost",
      size: "sm",
      icon: "PanelTop",
      label: t("settings.megamenu"),
      className: "join-item border border-base-300",
      dataValue: "megamenu",
      onPress: handleSettingsNavigationClick,
    }),
    [navigationMode, t],
  );
  const menuOnButtonProps = useMemo<TypeButtonProps>(
    () => ({
      action: isMenuVisible ? "primary" : "ghost",
      size: "sm",
      icon: "Eye",
      label: t("settings.menuOn"),
      className: "join-item border border-base-300",
      dataValue: "on",
      onPress: handleSettingsMenuClick,
    }),
    [isMenuVisible, t],
  );
  const menuOffButtonProps = useMemo<TypeButtonProps>(
    () => ({
      action: isMenuVisible ? "ghost" : "primary",
      size: "sm",
      icon: "EyeOff",
      label: t("settings.menuOff"),
      className: "join-item border border-base-300",
      dataValue: "off",
      onPress: handleSettingsMenuClick,
    }),
    [isMenuVisible, t],
  );

  const themeButtonProps = useMemo(
    () =>
      Object.fromEntries(
        [...lightThemes, ...darkThemes].map((themeName) => [
          themeName,
          {
            action: themeName === theme ? ("primary" as const) : ("ghost" as const),
            label: themeName,
            size: "sm" as const,
            icon: undefined,
            className:
              "gap-2 border border-base-300 capitalize",
            dataValue: themeName,
            onPress: handleSettingsThemeClick,
          } satisfies TypeButtonProps,
        ]),
      ) as Record<string, TypeButtonProps>,
    [darkThemes, lightThemes, t, theme],
  );

  return {
    titleText: t("settings.title"),
    themeTitle: t("settings.theme"),
    lightThemesTitle: t("ui.lightThemes"),
    darkThemesTitle: t("ui.darkThemes"),
    theme: theme,
    lightThemes: lightThemes,
    darkThemes: darkThemes,
    layoutTitle: t("ui.layout"),
    appLayoutText: t("ui.appLayout"),
    asideLayoutText: t("ui.asideLayout"),
    layoutChoice: layoutChoiceSignal.value,
    navigationTitle: t("settings.navigation"),
    sidebarText: t("settings.sidebar"),
    megaMenuText: t("settings.megamenu"),
    navigationMode: navigationModeSignal.value,
    hasMenu: navigationSignal.value.length > 0,
    menuTitle: t("settings.menu"),
    menuOnText: t("settings.menuOn"),
    menuOffText: t("settings.menuOff"),
    isMenuVisible: isMenuVisibleSignal.value,
    appLayoutButtonProps,
    asideLayoutButtonProps,
    sidebarButtonProps,
    megaMenuButtonProps,
    menuOnButtonProps,
    menuOffButtonProps,
    themeButtonProps,
  };
}
