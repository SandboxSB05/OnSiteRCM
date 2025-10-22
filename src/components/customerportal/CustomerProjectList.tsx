import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  on_hold: "bg-red-100 text-red-800"
};

interface ProjectType {
  id: string;
  project_name: string;
  project_address: string;
  project_status: string;
  start_date: string;
  project_budget?: number;
  [key: string]: any;
}

interface CustomerProjectListProps {
  projects: ProjectType[];
}

export default function CustomerProjectList({ projects }: CustomerProjectListProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Project History ({projects.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project: ProjectType) => (
          <div key={project.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{project.project_name}</h4>
              <p className="text-sm text-gray-500">{project.project_address}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge className={statusColors[project.project_status] || "bg-gray-100 text-gray-800"}>
                {project.project_status.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(project.start_date), 'MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span>{project.project_budget?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
         {projects.length === 0 && (
          <div className="text-center py-6">
              <p className="text-gray-500">No projects found for this customer.</p>
          </div>
      )}
      </CardContent>
    </Card>
  );
}