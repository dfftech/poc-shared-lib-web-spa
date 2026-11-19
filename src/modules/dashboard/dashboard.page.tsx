// dashboard.page.tsx — view only.
import { ContentLayout, HeadLayout } from "shared-lib-web";
import type { ReactElement } from "react";
import { useDashboard, type DashboardStat } from "./dashboard.page.ts";

function buildStatElements(stats: DashboardStat[]): ReactElement[] {
  const elements: ReactElement[] = [];
  for (const stat of stats) {
    const element = (
      <div key={stat.id} className="stat">
        <div className="stat-title">{stat.title}</div>
        <div className="stat-value text-primary capitalize">{stat.value}</div>
      </div>
    );
    elements.push(element);
  }
  return elements;
}

export function DashboardPage() {
  const { titleText, stats } = useDashboard();
  const statElements = buildStatElements(stats);
  return (
    <>
      <HeadLayout title={titleText} />
      <ContentLayout className="mt-4">
        <div className="stats stats-vertical w-full lg:stats-horizontal">{statElements}</div>
      </ContentLayout>
    </>
  );
}
