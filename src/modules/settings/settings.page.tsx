// settings.page.tsx — view only. Basic example: one language and no branches, so no language or store section.
import { ContentLayout, HeadLayout, TypeButton, TypeIcon, type Theme } from "shared-lib-web";
import type { ReactElement } from "react";
import { handleSettingsThemeClick, useSettings } from "./settings.page.ts";

/** One button per theme, with the theme's primary / secondary / accent colours. */
function buildThemeButtons(
  themes: Theme[],
  activeTheme: Theme,
): ReactElement[] {
  const buttons: ReactElement[] = [];
  for (const themeName of themes) {
    const button = (
      <button
        type="button"
        key={themeName}
        className={`btn btn-sm gap-2 border border-base-300 capitalize ${
          themeName === activeTheme ? "btn-primary" : "btn-ghost"
        }`}
        data-value={themeName}
        aria-pressed={themeName === activeTheme}
        onClick={handleSettingsThemeClick}
      >
        <span data-theme={themeName} className="flex gap-0.5 rounded bg-base-100 p-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-primary" />
          <span className="size-2 rounded-full bg-secondary" />
          <span className="size-2 rounded-full bg-accent" />
        </span>
        {themeName}
      </button>
    );
    buttons.push(button);
  }
  return buttons;
}

export function SettingsPage() {
  const {
    titleText,
    themeTitle,
    lightThemesTitle,
    darkThemesTitle,
    theme,
    lightThemes,
    darkThemes,
    layoutTitle,
    navigationTitle,
    hasMenu,
    menuTitle,
    appLayoutButtonProps,
    asideLayoutButtonProps,
    sidebarButtonProps,
    megaMenuButtonProps,
    menuOnButtonProps,
    menuOffButtonProps,
  } = useSettings();
  const lightThemeButtons = buildThemeButtons(lightThemes, theme);
  const darkThemeButtons = buildThemeButtons(darkThemes, theme);

  return (
    <>
      <HeadLayout title={titleText} />
      <ContentLayout className="mt-4 space-y-6">
        <div>
          <h3 className="mb-2 font-semibold">{layoutTitle}</h3>
          <div className="join">
            <TypeButton {...appLayoutButtonProps} />
            <TypeButton {...asideLayoutButtonProps} />
          </div>
        </div>
        {/* No menu items yet: no sidebar / mega menu choice. */}
        {hasMenu ? (
          <div>
            <h3 className="mb-2 font-semibold">{navigationTitle}</h3>
            <div className="join">
              <TypeButton {...sidebarButtonProps} />
              <TypeButton {...megaMenuButtonProps} />
            </div>
          </div>
        ) : null}
        <div>
          <h3 className="mb-2 font-semibold">{menuTitle}</h3>
          <div className="join">
            <TypeButton {...menuOnButtonProps} />
            <TypeButton {...menuOffButtonProps} />
          </div>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">{themeTitle}</h3>
          <div className="space-y-3">
            <div>
              <h4 className="mb-1 flex items-center gap-1 text-sm opacity-70">
                <TypeIcon name="Sun" size={14} />
                {lightThemesTitle}
              </h4>
              <div className="flex flex-wrap gap-2">{lightThemeButtons}</div>
            </div>
            <div>
              <h4 className="mb-1 flex items-center gap-1 text-sm opacity-70">
                <TypeIcon name="Moon" size={14} />
                {darkThemesTitle}
              </h4>
              <div className="flex flex-wrap gap-2">{darkThemeButtons}</div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </>
  );
}
