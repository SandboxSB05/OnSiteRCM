import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Save } from "lucide-react";
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { Project } from '@/api/supabaseEntities';

export default function InteractiveTimeline({ project, onProjectUpdate }) {
  const [isDragging, setIsDragging] = useState(null);
  const [tempDates, setTempDates] = useState({
    start: project.estimated_start_date,
    end: project.estimated_end_date
  });
  const [hasChanges, setHasChanges] = useState(false);

  const startDate = tempDates.start ? parseISO(tempDates.start) : null;
  const endDate = tempDates.end ? parseISO(tempDates.end) : null;
  const today = new Date();
  
  const projectDays = startDate && endDate && isValid(startDate) && isValid(endDate) 
    ? differenceInDays(endDate, startDate) + 1 
    : 30; // fallback

  const elapsedDays = startDate && isValid(startDate) 
    ? Math.max(0, Math.min(differenceInDays(today, startDate), projectDays))
    : 0;

  const progressPercentage = projectDays > 0 ? (elapsedDays / projectDays) * 100 : 0;

  const statusProgress = {
    'planning': 10,
    'in_progress': 50,
    'completed': 100,
    'on_hold': 25
  };

  const actualProgress = statusProgress[project.project_status] || 0;

  const handleDateChange = (field, value) => {
    setTempDates(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = useCallback(async () => {
    try {
      const updateData = {
        estimated_start_date: tempDates.start,
        estimated_end_date: tempDates.end
      };
      
      await Project.update(project.id, updateData);
      onProjectUpdate(updateData);
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating project timeline:", error);
    }
  }, [project.id, tempDates, onProjectUpdate]);

  const handleReset = () => {
    setTempDates({
      start: project.estimated_start_date,
      end: project.estimated_end_date
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Project Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`
                ${project.project_status === 'completed' ? 'bg-green-100 text-green-800' :
                  project.project_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  project.project_status === 'on_hold' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'}
              `}>
                {project.project_status.replace('_', ' ').toUpperCase()}
              </Badge>
              {hasChanges && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Start Date
              </label>
              <input
                type="date"
                value={tempDates.start || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated End Date
              </label>
              <input
                type="date"
                value={tempDates.end || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Visual Timeline */}
          {startDate && endDate && isValid(startDate) && isValid(endDate) && (
            <div className="space-y-4">
              <div className="relative">
                {/* Timeline Background */}
                <div className="h-8 bg-gray-200 rounded-full relative overflow-hidden">
                  {/* Progress Bar */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(actualProgress, 100)}%` }}
                  />
                  
                  {/* Today Marker */}
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-red-500"
                    style={{ left: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
                  >
                    <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Today
                    </div>
                  </div>
                </div>

                {/* Date Labels */}
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <div>
                    <div className="font-medium">{format(startDate, 'MMM d, yyyy')}</div>
                    <div className="text-xs">Start Date</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{format(endDate, 'MMM d, yyyy')}</div>
                    <div className="text-xs">End Date</div>
                  </div>
                </div>
              </div>

              {/* Project Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">{projectDays}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-900">{elapsedDays}</div>
                  <div className="text-sm text-blue-600">Days Elapsed</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-900">{actualProgress}%</div>
                  <div className="text-sm text-green-600">Project Progress</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.max(0, projectDays - elapsedDays)}
                  </div>
                  <div className="text-sm text-purple-600">Days Remaining</div>
                </div>
              </div>
            </div>
          )}

          {(!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Set both start and end dates to view the interactive timeline</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}