// dashboard.page.ts — TypeScript only: values shown on the dashboard.
import { useUi } from "shared-lib-web";
import { useSignals } from "@preact/signals-react/runtime";

export interface DashboardStat {
  id: string;
  title: string;
  value: string;
}

export interface DashboardModel {
  titleText: string;
  stats: DashboardStat[];
}

export function useDashboard(): DashboardModel {
  useSignals();
  const { t, locale, theme, direction } = useUi();
  return {
    titleText: t("dashboard.title"),
    stats: [
      { id: "locale", title: t("dashboard.language"), value: locale.toUpperCase() },
      { id: "theme", title: t("dashboard.theme"), value: theme },
      { id: "direction", title: t("dashboard.direction"), value: direction.toUpperCase() },
    ],
  };
}
