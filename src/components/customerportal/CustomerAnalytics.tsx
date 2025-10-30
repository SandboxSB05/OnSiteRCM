import React from 'react';
import KeyMetrics from '../analytics/KeyMetrics';
import RevenueCostChart from '../analytics/RevenueCostChart';
import CostBreakdownChart from '../analytics/CostBreakdownChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CostBreakdownItem {
  name: string;
  value: number;
}

interface CustomerAnalyticsData {
  roi: number;
  profitMargin: number;
  revenue: number;
  totalCost: number;
  costBreakdown: CostBreakdownItem[];
  [key: string]: any;
}

interface CustomerAnalyticsProps {
  data: CustomerAnalyticsData;
}

export default function CustomerAnalytics({ data }: CustomerAnalyticsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Holistic Customer Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <KeyMetrics data={data} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueCostChart data={data} />
          </div>
          <CostBreakdownChart data={data.costBreakdown} />
        </div>
      </CardContent>
    </Card>
  );
}