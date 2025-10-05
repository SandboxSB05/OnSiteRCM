import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Building } from 'lucide-react';

const statusColors = {
  planning: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  on_hold: "bg-red-100 text-red-800"
};

const statusLabels = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold"
};

const typeLabels = {
  residential_replacement: "Residential Replacement",
  residential_repair: "Residential Repair",
  commercial_replacement: "Commercial Replacement",
  commercial_repair: "Commercial Repair",
  new_construction: "New Construction"
};

export default function ProjectHeader({ project }) {
  const projectTypeLabel = typeLabels[project.project_type] || "Unknown Type";
  const statusLabel = statusLabels[project.project_status] || "Unknown Status";
  const statusColor = statusColors[project.project_status] || "bg-gray-100 text-gray-800";

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
              <Badge className={statusColor}>{statusLabel}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{projectTypeLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{project.client_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{project.project_address}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}