import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays } from 'date-fns';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function PerformanceVariance({ data }) {
  const { project, totalCost } = data;

  const plannedDays = differenceInDays(
    new Date(project.estimated_completion),
    new Date(project.start_date)
  );
  
  const actualDays = differenceInDays(
    new Date(project.actual_completion || project.estimated_completion), // Fallback
    new Date(project.start_date)
  );

  const costVariance = (project.project_budget || 0) - totalCost;
  const timeVariance = plannedDays - actualDays;

  const VarianceItem = ({ title, planned, actual, variance, unit }) => {
    const isPositive = variance >= 0;
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-sm">
            Planned: {planned.toLocaleString()}{unit} | Actual: {actual.toLocaleString()}{unit}
          </p>
        </div>
        <div className={`flex items-center font-semibold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
          {Math.abs(variance).toLocaleString()}{unit} {isPositive ? 'Under' : 'Over'}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <CardTitle>Planned vs. Actual Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <VarianceItem 
          title="Cost"
          planned={project.project_budget || 0}
          actual={totalCost}
          variance={costVariance}
          unit="$"
        />
        <VarianceItem
          title="Timeline"
          planned={plannedDays}
          actual={actualDays}
          variance={timeVariance}
          unit=" days"
        />
      </CardContent>
    </Card>
  );
}