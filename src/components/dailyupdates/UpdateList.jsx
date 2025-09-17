import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Camera, MessageSquare, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpdateList({ updates, projects, isLoading, onView }) {
  const getProjectInfo = (projectId) => {
    return projects.find(p => p.id === projectId) || {};
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No updates yet</h3>
        <p className="mt-1 text-sm text-gray-500">Create the first daily update to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => {
        const project = getProjectInfo(update.project_id);
        return (
          <Card 
            key={update.id} 
            className="shadow-sm border-0 bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(update)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.project_name || 'Unknown Project'}</h3>
                    <p className="text-sm text-gray-500">For: {project.client_name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(update.update_date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{update.ai_summary || update.pm_description}</p>
                <div className="flex flex-wrap gap-2">
                  {update.progress_photos && update.progress_photos.length > 0 && (
                    <Badge variant="outline"><Camera className="w-3 h-3 mr-1" />{update.progress_photos.length} photos</Badge>
                  )}
                  {update.sent_to_customer ? (
                    <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
                  )}
                  {update.completion_percentage && (
                    <Badge variant="secondary">{update.completion_percentage}% Complete</Badge>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}