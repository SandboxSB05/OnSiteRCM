import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, MapPin, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RecentProjects({ projects, isLoading }: { projects: any[], isLoading: boolean }) {
  const recentProjects = projects.slice(0, 5);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Recent Projects</CardTitle>
        <Link to={createPageUrl("Projects")}>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
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
              <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {project.project_name}
                    </h3>
                    <Badge className={`${statusColors[project.project_status as keyof typeof statusColors] || ''} border text-xs`}>
                      {statusLabels[project.project_status as keyof typeof statusLabels] || project.project_status}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{project.client_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{project.project_address}</span>
                    </div>
                    {isValidDate(project.estimated_end_date) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {format(new Date(project.estimated_end_date), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {project.project_budget && (
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${project.project_budget.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Budget</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No projects yet</div>
            <Link to={createPageUrl("Projects")}>
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}