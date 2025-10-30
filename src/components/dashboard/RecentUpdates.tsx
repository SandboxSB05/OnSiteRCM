import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Camera, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type RecentUpdatesVariant = "default" | "contractor";

interface RecentUpdatesProps {
  dailyUpdates: any[];
  projects: any[];
  isLoading: boolean;
  variant?: RecentUpdatesVariant;
}

export default function RecentUpdates({
  dailyUpdates,
  projects,
  isLoading,
  variant = "default",
}: RecentUpdatesProps) {
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.project_name || 'Unknown Project';
  };

  const recentUpdates = dailyUpdates.slice(0, 4);

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

  const buttonProps =
    variant === "contractor"
      ? {
          variant: "default" as const,
          size: "lg" as const,
          className:
            "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-none hover:from-emerald-600 hover:to-teal-700",
        }
      : { variant: "outline" as const, size: "sm" as const, className: undefined };

  const contentClass =
    variant === "contractor" ? "p-8 pt-6 space-y-4" : undefined;

  const updateCardClass =
    variant === "contractor"
      ? "rounded-2xl border border-[rgba(3,2,19,0.08)] p-5 transition-all hover:border-emerald-200 hover:shadow-xl"
      : "p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow";

  const updateTitleClass =
    variant === "contractor"
      ? "text-lg font-semibold text-[#030213]"
      : "font-medium text-gray-900";

  const bodyTextClass =
    variant === "contractor"
      ? "text-sm text-[#717182] mb-4 line-clamp-2"
      : "text-sm text-gray-600 mb-3 line-clamp-2";

  const metaTextClass =
    variant === "contractor" ? "text-xs text-[#717182]" : "text-xs text-gray-500";

  const badgeClass =
    variant === "contractor"
      ? "text-xs border border-[rgba(3,2,19,0.12)] text-[#030213]"
      : "text-xs";

  const skeletonCardClass =
    variant === "contractor"
      ? "rounded-2xl border border-[rgba(3,2,19,0.08)] p-5"
      : "p-4 border border-gray-100 rounded-lg";

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
        <CardTitle className={headerTitleClass}>Recent Updates</CardTitle>
        <Link to={createPageUrl("DailyUpdates")}>
          <Button {...buttonProps}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className={contentClass}>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className={skeletonCardClass}>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((update) => (
              <div key={update.id} className={updateCardClass}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={updateTitleClass}>
                    {getProjectName(update.project_id)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className={metaTextClass}>
                      {format(new Date(update.update_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <p className={bodyTextClass}>
                  {update.ai_summary || update.pm_description}
                </p>
                
                <div className="flex flex-wrap items-center gap-2">
                  {update.progress_photos && update.progress_photos.length > 0 && (
                    <Badge variant="outline" className={badgeClass}>
                      <Camera className="mr-1 h-3 w-3" />
                      {update.progress_photos.length} photos
                    </Badge>
                  )}
                  
                  {update.completion_percentage && (
                    <Badge variant="outline" className={badgeClass}>
                      {update.completion_percentage}% complete
                    </Badge>
                  )}
                  
                  {update.sent_to_customer ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Sent to customer
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={emptyStateClass}>
            <div className={emptyTextClass}>No updates yet</div>
            <Link to={createPageUrl("DailyUpdates")}>
              <Button className={emptyButtonClass}>Create Your First Update</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
