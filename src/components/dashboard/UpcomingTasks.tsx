import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { format, addDays, isBefore, isToday, isTomorrow } from "date-fns";
import { Badge } from "@/components/ui/badge";

type UpcomingTasksVariant = "default" | "contractor";

interface UpcomingTasksProps {
  projects: any[];
  isLoading: boolean;
  variant?: UpcomingTasksVariant;
}

const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

export default function UpcomingTasks({
  projects,
  isLoading,
  variant = "default",
}: UpcomingTasksProps) {
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
    high:
      variant === "contractor"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-red-100 text-red-800 border-red-200",
    medium:
      variant === "contractor"
        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
        : "bg-yellow-100 text-yellow-800 border-yellow-200",
    low:
      variant === "contractor"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : "bg-green-100 text-green-800 border-green-200",
  };

  const getDateLabel = (date) => {
    if (!isValidDate(date)) return "Invalid Date";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'MMM d');
  };

  const cardClassName =
    variant === "contractor"
      ? "bg-white shadow-sm border border-[rgba(0,0,0,0.1)] rounded-3xl transition-all hover:shadow-xl hover:border-emerald-200"
      : "shadow-lg border-0";

  const headerClassName =
    variant === "contractor"
      ? "flex items-center gap-3 p-8 pb-6"
      : undefined;

  const titleClass =
    variant === "contractor"
      ? "text-[1.5rem] font-semibold tracking-tight text-[#030213]"
      : "text-xl font-semibold flex items-center gap-2";

  const contentClass =
    variant === "contractor" ? "p-8 pt-0 space-y-4" : undefined;

  const itemClass =
    variant === "contractor"
      ? "flex flex-col gap-3 rounded-2xl border border-[rgba(3,2,19,0.08)] p-5 sm:flex-row sm:items-center sm:justify-between"
      : "flex items-center justify-between p-3 border border-gray-100 rounded-lg";

  const projectTitleClass =
    variant === "contractor"
      ? "text-sm font-medium text-[#030213] truncate"
      : "font-medium text-gray-900 text-sm truncate";

  const metaTextClass =
    variant === "contractor" ? "text-xs text-[#717182]" : "text-xs text-gray-600";

  const dateTextClass =
    variant === "contractor"
      ? "text-sm font-semibold text-[#030213]"
      : "text-sm font-medium text-gray-900";

  const emptyStateClass =
    variant === "contractor"
      ? "rounded-3xl border border-dashed border-[rgba(3,2,19,0.12)] bg-[#f9fafb] py-10 text-center"
      : "text-center py-6 text-gray-500";

  const emptyIconClass =
    variant === "contractor"
      ? "mx-auto mb-4 h-12 w-12 text-emerald-200"
      : "w-12 h-12 mx-auto text-gray-300 mb-2";

  const emptyTextClass =
    variant === "contractor" ? "text-[#717182]" : undefined;

  return (
    <Card className={cardClassName}>
      <CardHeader className={headerClassName}>
        <CardTitle className={titleClass}>
          <span className={variant === "contractor" ? "inline-flex items-center gap-3" : "flex items-center gap-2"}>
            <Calendar className="h-5 w-5" />
            Upcoming Tasks
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className={contentClass}>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={itemClass}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={projectTitleClass}>
                      {task.project_name}
                    </h4>
                    <Badge className={`${priorityColors[task.priority]} border text-xs`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className={`flex items-center gap-2 ${metaTextClass}`}>
                    {task.type === "start" ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    <span>{task.task}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={dateTextClass}>
                    {getDateLabel(task.date)}
                  </div>
                  {isValidDate(task.date) && (
                    <div className={metaTextClass}>
                      {format(new Date(task.date), 'h:mm a')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={emptyStateClass}>
            <Calendar className={emptyIconClass} />
            <p className={emptyTextClass}>No upcoming tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
