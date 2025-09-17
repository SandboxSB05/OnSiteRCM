import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenueCostChart({ data }) {
  const chartData = [
    { name: 'Financials', Revenue: data.revenue, Cost: data.totalCost, Profit: data.netProfit }
  ];

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <CardTitle>Revenue vs. Cost & Profit</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
            <Tooltip
              formatter={(value) => `$${value.toLocaleString()}`}
              cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
            />
            <Legend />
            <Bar dataKey="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cost" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}