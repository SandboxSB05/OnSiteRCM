import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { format, addDays, isBefore, isToday, isTomorrow } from "date-fns";
import { Badge } from "@/components/ui/badge";

const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

export default function UpcomingTasks({ projects, isLoading }) {
  const getUpcomingTasks = () => {
    const tasks = [];
    const today = new Date();
    
    projects.forEach(project => {
      if (project.project_status === 'in_progress' || project.project_status === 'planning') {
        if (project.estimated_start_date && project.project_status === 'planning' && isValidDate(project.estimated_start_date)) {
          const startDate = new Date(project.estimated_start_date);
          if (isBefore(startDate, addDays(today, 7))) {
            tasks.push({
              id: `start-${project.id}`,
              project_name: project.project_name,
              task: "Project Start",
              date: startDate,
              priority: isToday(startDate) ? "high" : isTomorrow(startDate) ? "medium" : "low",
              type: "start"
            });
          }
        }
        
        if (project.estimated_end_date && project.project_status === 'in_progress' && isValidDate(project.estimated_end_date)) {
          const completionDate = new Date(project.estimated_end_date);
          if (isBefore(completionDate, addDays(today, 7))) {
            tasks.push({
              id: `completion-${project.id}`,
              project_name: project.project_name,
              task: "Project Completion",
              date: completionDate,
              priority: isBefore(completionDate, today) ? "high" : "medium",
              type: "completion"
            });
          }
        }
      }
    });
    
    return tasks.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
  };

  const tasks = getUpcomingTasks();

  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200"
  };

  const getDateLabel = (date) => {
    if (!isValidDate(date)) return "Invalid Date";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'MMM d');
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {task.project_name}
                    </h4>
                    <Badge className={`${priorityColors[task.priority]} border text-xs`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    {task.type === "start" ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span>{task.task}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {getDateLabel(task.date)}
                  </div>
                  {isValidDate(task.date) && (
                    <div className="text-xs text-gray-500">
                      {format(new Date(task.date), 'h:mm a')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No upcoming tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}