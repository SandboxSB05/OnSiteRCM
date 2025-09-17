import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Camera, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentUpdates({ dailyUpdates, projects, isLoading }) {
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.project_name || 'Unknown Project';
  };

  const recentUpdates = dailyUpdates.slice(0, 4);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Recent Updates</CardTitle>
        <Link to={createPageUrl("DailyUpdates")}>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-lg">
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
              <div key={update.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {getProjectName(update.project_id)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {format(new Date(update.update_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {update.ai_summary || update.pm_description}
                </p>
                
                <div className="flex flex-wrap items-center gap-2">
                  {update.progress_photos && update.progress_photos.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Camera className="w-3 h-3 mr-1" />
                      {update.progress_photos.length} photos
                    </Badge>
                  )}
                  
                  {update.completion_percentage && (
                    <Badge variant="outline" className="text-xs">
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
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No updates yet</div>
            <Link to={createPageUrl("DailyUpdates")}>
              <Button>Create Your First Update</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}