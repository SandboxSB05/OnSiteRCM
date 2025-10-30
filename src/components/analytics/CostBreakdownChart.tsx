import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#16a34a', '#f97316', '#8b5cf6', '#ef4444', '#64748b'];

interface CostBreakdownItem {
  name: string;
  value: number;
}

interface CostBreakdownChartProps {
  data: CostBreakdownItem[];
}

export default function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  const totalCost = data.reduce((sum: number, entry: CostBreakdownItem) => sum + entry.value, 0);

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: CostBreakdownItem, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()} (${((value as number / totalCost) * 100).toFixed(1)}%)`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}