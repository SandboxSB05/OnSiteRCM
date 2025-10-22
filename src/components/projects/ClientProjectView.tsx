import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Ruler, Briefcase } from "lucide-react";

interface ProjectType {
  id: string;
  project_name: string;
  project_type: string;
  project_status: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  estimated_subtotal?: number;
  square_footage?: number;
  estimated_start_date?: string;
  estimated_completion_date?: string;
  actual_start_date?: string;
  actual_completion_date?: string;
  [key: string]: any;
}

interface ClientProjectViewProps {
  project: ProjectType;
}

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  on_hold: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  residential_replacement: "Residential Replacement",
  residential_repair: "Residential Repair",
  commercial_replacement: "Commercial Replacement",
  commercial_repair: "Commercial Repair",
  new_construction: "New Construction",
};

export default function ClientProjectView({ project }: ClientProjectViewProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{project.project_name}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{typeLabels[project.project_type] || project.project_type}</span>
                </div>
              </CardDescription>
            </div>
            <Badge className={statusColors[project.project_status] || "bg-gray-100 text-gray-800"}>
              {project.project_status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Project Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="font-medium">{project.address_line1}</p>
              {project.address_line2 && <p className="text-sm text-gray-600">{project.address_line2}</p>}
              <p className="text-sm text-gray-600">
                {project.city}, {project.state} {project.zip_code}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Project Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Start</p>
              <p className="text-lg">{formatDate(project.estimated_start_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Completion</p>
              <p className="text-lg">{formatDate(project.estimated_completion_date)}</p>
            </div>
            {project.actual_start_date && (
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Start</p>
                <p className="text-lg">{formatDate(project.actual_start_date)}</p>
              </div>
            )}
            {project.actual_completion_date && (
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Completion</p>
                <p className="text-lg">{formatDate(project.actual_completion_date)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Subtotal</p>
              <p className="text-2xl font-bold">{formatCurrency(project.estimated_subtotal)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Project Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Square Footage</p>
              <p className="text-lg">
                {project.square_footage ? `${project.square_footage.toLocaleString()} sq ft` : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future sections */}
      <Card>
        <CardHeader>
          <CardTitle>Project Updates</CardTitle>
          <CardDescription>
            Daily updates and progress photos will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No updates yet. Your contractor will post updates as work progresses.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Photos</CardTitle>
          <CardDescription>
            Progress photos and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Photos will be added as the project progresses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
