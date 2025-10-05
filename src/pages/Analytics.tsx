
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Project } from "@/api/entities";
import { DailyUpdate } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, AlertCircle } from "lucide-react";

import ProjectSelector from "../components/analytics/ProjectSelector";
import KeyMetrics from "../components/analytics/KeyMetrics";
import RevenueCostChart from "../components/analytics/RevenueCostChart";
import CostBreakdownChart from "../components/analytics/CostBreakdownChart";
import PerformanceVariance from "../components/analytics/PerformanceVariance";
import AiInsights from "../components/analytics/AiInsights";

const LABOR_RATE_PER_HOUR = 50; // Assumption for labor cost calculation

// Moved outside component to be a stable function
const categorizeMaterial = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('shingle')) return 'Shingles';
    if (lowerName.includes('underlay')) return 'Underlayment';
    if (lowerName.includes('nail')) return 'Nails';
    if (lowerName.includes('flash')) return 'Flashing';
    return 'Miscellaneous';
};

export default function Analytics() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const completedProjects = await Project.filter({ project_status: 'completed' });
        setProjects(completedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  const calculateAnalytics = useCallback(async (projectId) => {
    setIsCalculating(true);
    setAnalyticsData(null);
    try {
      // 'projects' is a dependency for useCallback because it's used here
      const project = projects.find(p => p.id === projectId); 
      if (!project) {
        console.warn(`Project with ID ${projectId} not found.`);
        setIsCalculating(false);
        return;
      }

      const updates = await DailyUpdate.filter({ project_id: projectId });

      const totalLaborHours = updates.reduce((sum, u) => sum + (u.hours_worked || 0), 0);
      const laborCost = totalLaborHours * LABOR_RATE_PER_HOUR;

      const materialCosts = updates.flatMap(u => u.materials_used || []);
      const totalMaterialCost = materialCosts.reduce((sum, m) => sum + (m.cost || 0), 0);
      
      const totalCost = laborCost + totalMaterialCost;
      const revenue = project.project_budget || 0;
      const netProfit = revenue - totalCost;
      const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
      
      // Cost Breakdown
      const costBreakdown = materialCosts.reduce((acc, item) => {
          const category = categorizeMaterial(item.material_name); // categorizeMaterial is now stable
          acc[category] = (acc[category] || 0) + (item.cost || 0);
          return acc;
      }, {});
      costBreakdown['Labor'] = laborCost;

      const formattedBreakdown = Object.entries(costBreakdown).map(([name, value]) => ({ name, value }));
      
      setAnalyticsData({
        project,
        revenue,
        totalCost,
        netProfit,
        roi,
        profitMargin,
        costBreakdown: formattedBreakdown,
        performance: { project, totalCost }
      });
    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
    setIsCalculating(false);
  }, [projects]); // Dependency: projects (because it's used in projects.find)

  useEffect(() => {
    if (selectedProjectId) {
      calculateAnalytics(selectedProjectId);
    } else {
      setAnalyticsData(null);
    }
  }, [selectedProjectId, calculateAnalytics]); // Dependency: calculateAnalytics (because it's a function defined in the component scope)

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Analytics</h1>
          <p className="text-gray-600 mt-1">Evaluate the profitability and performance of completed projects.</p>
        </div>
        <ProjectSelector 
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          isLoading={isLoading}
        />
      </div>
      
      {isCalculating && <AnalyticsSkeleton />}

      {!isCalculating && analyticsData && (
        <div className="space-y-6">
          <KeyMetrics data={analyticsData} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <RevenueCostChart data={analyticsData} />
            </div>
            <CostBreakdownChart data={analyticsData.costBreakdown} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
                <PerformanceVariance data={analyticsData.performance} />
             </div>
             <AiInsights analyticsData={analyticsData} />
          </div>
        </div>
      )}

      {!selectedProjectId && !isLoading && (
        <Card className="mt-6 flex flex-col items-center justify-center py-20 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Select a Project</h3>
            <p className="text-gray-500 mt-1">Choose a completed project to view its financial analysis.</p>
        </Card>
      )}

      {!isLoading && projects.length === 0 && (
          <Card className="mt-6 flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">No Completed Projects</h3>
              <p className="text-gray-500 mt-1">Complete a project to see its analytics here.</p>
          </Card>
      )}
    </div>
  );
}

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  </div>
);
