import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type StatsOverviewVariant = "default" | "contractor";

interface StatsData {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  totalRevenue: number;
  completionRate: number;
}

interface StatsOverviewProps {
  stats: StatsData;
  isLoading: boolean;
  variant?: StatsOverviewVariant;
}

export default function StatsOverview({
  stats,
  isLoading,
  variant = "default",
}: StatsOverviewProps) {
  const statsCards = [
    {
      title: "Total Projects",
      value: stats.total,
      icon: FolderOpen,
      color: "blue" as const,
      description: `${stats.active} active, ${stats.completed} completed`
    },
    {
      title: "Active Projects",
      value: stats.active,
      icon: Clock,
      color: "orange" as const,
      description: "Planning or in progress"
    },
    {
      title: "On-Time Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "purple" as const,
      description: "Completed vs overdue projects"
    }
  ];

  const colorClasses =
    variant === "contractor"
      ? {
          blue: "from-rose-500 to-pink-600 text-white",
          orange: "from-amber-500 to-orange-600 text-white",
          purple: "from-indigo-500 to-purple-600 text-white",
        }
      : {
          blue: "from-blue-500 to-blue-600 text-white",
          orange: "from-orange-500 to-orange-600 text-white",
          purple: "from-purple-500 to-purple-600 text-white",
        };

  const cardClassName =
    variant === "contractor"
      ? "relative overflow-hidden rounded-3xl border border-[rgba(0,0,0,0.1)] bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl"
      : "relative overflow-hidden border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl";

  const iconWrapperClass =
    variant === "contractor"
      ? "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r"
      : "rounded-lg bg-gradient-to-br p-2";

  const titleClass =
    variant === "contractor"
      ? "text-sm font-medium text-[#717182]"
      : "text-sm font-medium text-gray-600";

  const valueClass =
    variant === "contractor"
      ? "text-3xl font-semibold tracking-tight text-[#030213]"
      : "text-2xl font-bold text-gray-900";

  const descriptionClass =
    variant === "contractor"
      ? "mt-3 text-sm text-[#717182]"
      : "mt-1 text-xs text-gray-500";

  const skeletonClass =
    variant === "contractor" ? "h-9 w-24" : "h-8 w-20";

  const overlayClass =
    variant === "contractor"
      ? "absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-transparent to-teal-100/10 pointer-events-none"
      : "absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br opacity-10";

  const overlayPositionClass =
    variant === "contractor" ? "" : "transform translate-x-6 -translate-y-6";

  const headerClass =
    variant === "contractor"
      ? "flex flex-row items-center justify-between space-y-0 p-8 pb-4"
      : "flex flex-row items-center justify-between space-y-0 pb-2";

  const contentClass =
    variant === "contractor" ? "p-8 pt-0" : undefined;

  return (
    <div
      className={
        variant === "contractor"
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      }
    >
      {statsCards.map((stat, index) => (
        <Card key={index} className={cardClassName}>
          <div className={`${overlayClass} ${overlayPositionClass}`} />
          <CardHeader className={headerClass}>
            <CardTitle className={titleClass}>{stat.title}</CardTitle>
            <div className={`${iconWrapperClass} ${colorClasses[stat.color]}`}>
              <stat.icon className={variant === "contractor" ? "h-5 w-5" : "h-4 w-4"} />
            </div>
          </CardHeader>
          <CardContent className={contentClass}>
            {isLoading ? (
              <Skeleton className={skeletonClass} />
            ) : (
              <div className={valueClass}>{stat.value}</div>
            )}
            <p className={descriptionClass}>{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
