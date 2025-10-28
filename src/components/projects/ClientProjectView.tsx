import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Ruler, Briefcase, Clock, CheckCircle, Image, FileText } from "lucide-react";

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
  planning: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-emerald-100 text-emerald-800 border-emerald-200",
  on_hold: "bg-orange-100 text-orange-800 border-orange-200",
  completed: "bg-teal-100 text-teal-800 border-teal-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
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
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-6 h-6" />
                <span className="text-sm uppercase tracking-wider text-white/80 font-medium">
                  {typeLabels[project.project_type] || project.project_type}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">{project.project_name}</h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-4 h-4" />
                <span className="text-lg">
                  {project.address_line1}, {project.city}, {project.state}
                </span>
              </div>
            </div>
            <Badge className={`${statusColors[project.project_status]} border text-sm px-4 py-1.5`}>
              {statusLabels[project.project_status] || project.project_status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-[#717182] mb-1">Project Budget</p>
            <p className="text-2xl font-bold text-[#030213]">{formatCurrency(project.estimated_subtotal)}</p>
          </CardContent>
        </Card>

        {/* Square Footage */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md">
                <Ruler className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-[#717182] mb-1">Square Footage</p>
            <p className="text-2xl font-bold text-[#030213]">
              {project.square_footage ? project.square_footage.toLocaleString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        {/* Start Date */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-[#717182] mb-1">Start Date</p>
            <p className="text-lg font-semibold text-[#030213]">
              {formatDate(project.actual_start_date || project.estimated_start_date)}
            </p>
          </CardContent>
        </Card>

        {/* Completion Date */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-[#717182] mb-1">Completion Date</p>
            <p className="text-lg font-semibold text-[#030213]">
              {formatDate(project.actual_completion_date || project.estimated_completion_date)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Details */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm">
          <CardHeader className="border-b border-[rgba(0,0,0,0.06)] pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-[#030213]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              Project Location
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div>
              <p className="text-base font-semibold text-[#030213]">{project.address_line1}</p>
              {project.address_line2 && (
                <p className="text-sm text-[#717182]">{project.address_line2}</p>
              )}
              <p className="text-sm text-[#717182]">
                {project.city}, {project.state} {project.zip_code}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Details */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm">
          <CardHeader className="border-b border-[rgba(0,0,0,0.06)] pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-[#030213]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#717182] mb-1">
                  Estimated Start
                </p>
                <p className="text-base font-semibold text-[#030213]">
                  {formatDate(project.estimated_start_date)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#717182] mb-1">
                  Estimated Completion
                </p>
                <p className="text-base font-semibold text-[#030213]">
                  {formatDate(project.estimated_completion_date)}
                </p>
              </div>
            </div>
            {(project.actual_start_date || project.actual_completion_date) && (
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[rgba(0,0,0,0.06)]">
                {project.actual_start_date && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 mb-1">
                      Actual Start
                    </p>
                    <p className="text-base font-semibold text-[#030213]">
                      {formatDate(project.actual_start_date)}
                    </p>
                  </div>
                )}
                {project.actual_completion_date && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 mb-1">
                      Actual Completion
                    </p>
                    <p className="text-base font-semibold text-[#030213]">
                      {formatDate(project.actual_completion_date)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Updates */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm">
          <CardHeader className="border-b border-[rgba(0,0,0,0.06)]">
            <CardTitle className="flex items-center gap-3 text-xl text-[#030213]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              Project Updates
            </CardTitle>
            <CardDescription className="text-[#717182]">
              Daily updates and progress reports from your contractor
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-xl border border-dashed border-[rgba(0,0,0,0.12)] bg-gradient-to-br from-blue-50/30 to-indigo-50/30 py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-[#717182]" />
              <p className="text-[#717182] font-medium">No updates yet</p>
              <p className="text-sm text-[#717182] mt-1">
                Your contractor will post updates as work progresses
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Project Photos */}
        <Card className="border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-sm">
          <CardHeader className="border-b border-[rgba(0,0,0,0.06)]">
            <CardTitle className="flex items-center gap-3 text-xl text-[#030213]">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Image className="w-5 h-5 text-emerald-600" />
              </div>
              Project Photos
            </CardTitle>
            <CardDescription className="text-[#717182]">
              Progress photos and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-xl border border-dashed border-[rgba(0,0,0,0.12)] bg-gradient-to-br from-emerald-50/30 to-teal-50/30 py-12 text-center">
              <Image className="w-12 h-12 mx-auto mb-3 text-[#717182]" />
              <p className="text-[#717182] font-medium">No photos yet</p>
              <p className="text-sm text-[#717182] mt-1">
                Photos will be added as the project progresses
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
