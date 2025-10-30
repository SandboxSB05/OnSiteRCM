import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, MapPin, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type RecentProjectsVariant = "default" | "contractor";

interface RecentProjectsProps {
  projects: any[];
  isLoading: boolean;
  variant?: RecentProjectsVariant;
  projectsPage?: string;
}

const statusColors = {
  planning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  on_hold: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold"
};

const isValidDate = (date: any) => {
  return date && !isNaN(new Date(date).getTime());
};

export default function RecentProjects({
  projects,
  isLoading,
  variant = "default",
  projectsPage = "Projects",
}: RecentProjectsProps) {
  const recentProjects = projects.slice(0, 5);

  const cardClassName =
    variant === "contractor"
      ? "bg-white shadow-sm border border-[rgba(0,0,0,0.1)] rounded-3xl transition-all hover:shadow-xl hover:border-emerald-200"
      : "shadow-lg border-0";

  const headerClassName =
    variant === "contractor"
      ? "flex flex-col gap-4 border-b border-[rgba(3,2,19,0.08)] p-8 pb-6 sm:flex-row sm:items-center sm:justify-between"
      : "flex flex-row items-center justify-between";

  const headerTitleClass =
    variant === "contractor"
      ? "text-[1.5rem] font-semibold tracking-tight text-[#030213]"
      : "text-xl font-semibold";

  const buttonClassName =
    variant === "contractor"
      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-none hover:from-emerald-600 hover:to-teal-700"
      : undefined;

  const contentClass =
    variant === "contractor" ? "p-8 pt-6 space-y-4" : undefined;

  const itemClass =
    variant === "contractor"
      ? "flex flex-col gap-4 rounded-2xl border border-[rgba(3,2,19,0.08)] p-5 transition-all hover:border-emerald-200 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between"
      : "flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow";

  const metaTextClass =
    variant === "contractor" ? "text-sm text-[#717182]" : "text-sm text-gray-600";

  const titleClass =
    variant === "contractor"
      ? "font-semibold text-lg text-[#030213]"
      : "font-semibold text-gray-900";

  const budgetLabelClass =
    variant === "contractor"
      ? "text-xs font-medium uppercase tracking-wide text-[#717182]"
      : "text-xs text-gray-500";

  const emptyStateClass =
    variant === "contractor"
      ? "rounded-3xl border border-dashed border-[rgba(3,2,19,0.12)] bg-[#f9fafb] py-10 text-center"
      : "text-center py-8";

  const emptyTextClass =
    variant === "contractor" ? "mb-4 text-[#717182]" : "text-gray-500 mb-2";

  const emptyButtonClass =
    variant === "contractor"
      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
      : undefined;

  return (
    <Card className={cardClassName}>
      <CardHeader className={headerClassName}>
        <CardTitle className={headerTitleClass}>Recent Projects</CardTitle>
        <Link to={createPageUrl(projectsPage)}>
          <Button
            variant={variant === "contractor" ? "default" : "outline"}
            size={variant === "contractor" ? "lg" : "sm"}
            className={buttonClassName}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className={contentClass}>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i: number) => (
                <div
                  key={i}
                  className={
                    variant === "contractor"
                      ? "rounded-2xl border border-[rgba(3,2,19,0.08)] p-5"
                      : "flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                  }
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
          </div>
        ) : recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project: any) => (
              <div key={project.id} className={itemClass}>
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className={`${titleClass} truncate`}>
                      {project.project_name}
                    </h3>
                    <Badge
                      className={`${
                        statusColors[
                          project.project_status as keyof typeof statusColors
                        ] || ""
                      } border text-xs`}
                    >
                      {statusLabels[
                        project.project_status as keyof typeof statusLabels
                      ] || project.project_status}
                    </Badge>
                  </div>
                  <div
                    className={`flex flex-col gap-2 text-sm sm:flex-row sm:items-center ${metaTextClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{project.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{project.project_address}</span>
                    </div>
                    {isValidDate(project.estimated_end_date) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Due {format(new Date(project.estimated_end_date), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {project.project_budget && (
                    <div className="ml-auto text-right">
                      <div
                        className={
                          variant === "contractor"
                            ? "text-xl font-semibold text-[#030213]"
                            : "font-semibold text-gray-900"
                        }
                      >
                        ${project.project_budget.toLocaleString()}
                      </div>
                      <div className={budgetLabelClass}>Budget</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={emptyStateClass}>
            <div className={emptyTextClass}>No projects yet</div>
            <Link to={createPageUrl(projectsPage)}>
              <Button className={emptyButtonClass}>
                Create Your First Project
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
