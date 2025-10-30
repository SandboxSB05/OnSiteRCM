import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Percent, DollarSign, Activity } from "lucide-react";

interface KeyMetricsData {
  roi: number;
  profitMargin: number;
  revenue: number;
  totalCost: number;
}

interface KeyMetricsProps {
  data: KeyMetricsData;
}

export default function KeyMetrics({ data }: KeyMetricsProps) {
  const metrics = [
    { 
      title: "ROI", 
      value: `${data.roi.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: "text-green-600",
      description: "Return on Investment"
    },
    { 
      title: "Profit Margin", 
      value: `${data.profitMargin.toFixed(1)}%`, 
      icon: Percent, 
      color: "text-blue-600",
      description: "Net Profit / Revenue"
    },
    { 
      title: "Total Revenue", 
      value: `$${data.revenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-purple-600",
      description: "Contracted project budget"
    },
    { 
      title: "Total Cost", 
      value: `$${data.totalCost.toLocaleString()}`, 
      icon: Activity, 
      color: "text-orange-600",
      description: "Sum of labor & materials"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map(metric => (
        <Card key={metric.title} className="shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{metric.title}</CardTitle>
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}