import { useState } from "react";
import { StatisticsFilter } from "@/api/statisticsApi";
import { StatisticsFilterBar } from "@/components/statistics/StatisticsFilterBar";
import { StatisticsHeader } from "@/components/statistics/StatisticsHeader";

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "-";

export const useStatisticsFilter = () =>
  useState<StatisticsFilter>({ range: "today" });

export function StatisticsPageShell({
  title,
  description,
  filter,
  setFilter,
  children,
}: {
  title: string;
  description: string;
  filter: StatisticsFilter;
  setFilter: (filter: StatisticsFilter) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <StatisticsHeader title={title} description={description} />
      <StatisticsFilterBar filter={filter} onChange={setFilter} />
      {children}
    </div>
  );
}
