import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverview({ stats, isLoading }) {
  const statsCards = [
    {
      title: "Total Projects",
      value: stats.total,
      icon: FolderOpen,
      color: "blue",
      description: `${stats.active} active, ${stats.completed} completed`
    },
    {
      title: "Active Projects",
      value: stats.active,
      icon: Clock,
      color: "orange",
      description: "Currently in progress"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "green",
      description: "Across all projects"
    },
    {
      title: "Completion Rate",
      value: stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "purple",
      description: "Projects completed on time"
    }
  ];

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-white",
    orange: "from-orange-500 to-orange-600 text-white",
    green: "from-green-500 to-green-600 text-white",
    purple: "from-purple-500 to-purple-600 text-white"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[stat.color]} opacity-10 rounded-full transform translate-x-6 -translate-y-6`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[stat.color]}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}