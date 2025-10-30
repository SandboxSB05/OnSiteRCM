
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvokeLLM } from "@/api/integrations";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CostBreakdownItem {
  name: string;
  value: number;
}

interface AnalyticsData {
  project: {
    project_name: string;
  };
  revenue: number;
  totalCost: number;
  netProfit: number;
  roi: number;
  profitMargin: number;
  costBreakdown: CostBreakdownItem[];
}

interface AiInsightsProps {
  analyticsData: AnalyticsData | null;
}

export default function AiInsights({ analyticsData }: AiInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateInsights = useCallback(async () => {
    setIsLoading(true);
    setInsights([]);

    // Check if analyticsData is available before proceeding
    if (!analyticsData) {
      setInsights(["No data available to generate insights."]);
      setIsLoading(false);
      return;
    }

    const dataSummary = `
      Project: ${analyticsData.project.project_name},
      Revenue: $${analyticsData.revenue.toFixed(2)},
      Total Cost: $${analyticsData.totalCost.toFixed(2)},
      Net Profit: $${analyticsData.netProfit.toFixed(2)},
      ROI: ${analyticsData.roi.toFixed(1)}%,
      Profit Margin: ${analyticsData.profitMargin.toFixed(1)}%,
      Cost Breakdown: ${analyticsData.costBreakdown.map((d: CostBreakdownItem) => `${d.name} $${d.value.toFixed(2)}`).join(', ')}
    `;

    const prompt = `You are a business analyst for a roofing company. Based on this project's financial data, generate 2-3 short, insightful bullet points. Focus on profitability, cost drivers, and overall performance.
    
    Data: ${dataSummary}
    
    Example output format:
    - Shingle costs accounted for 42% of total expenses.
    - Labor costs exceeded estimate by 12%.
    - Overall project delivered +$5,200 net profit.
    
    Generate exactly 3 bullet points starting with '-'.`;

    try {
      const response = await InvokeLLM({
        prompt: prompt,
      });
      // Filter out empty strings that might result from split if prompt ends with '- '
      const responseText = typeof response === 'string' ? response : (response as any).text || '';
      setInsights(responseText.split('- ').filter((item: string) => item.trim() !== ''));
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights(["Could not generate insights at this time."]);
    }
    setIsLoading(false);
  }, [analyticsData]); // analyticsData is a dependency because it's used inside generateInsights

  useEffect(() => {
    if (analyticsData) {
      generateInsights();
    }
  }, [analyticsData, generateInsights]); // generateInsights is a dependency because it's used inside useEffect

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-500" />
                <span>{insight.trim()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
