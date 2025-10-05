
import React, { useState, useEffect, useCallback } from "react";
import { Project } from "@/api/entities";
import { DailyUpdate } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FolderOpen, DollarSign, Activity, Clock } from "lucide-react";

import KeyMetrics from "../components/analytics/KeyMetrics";
import RevenueCostChart from "../components/analytics/RevenueCostChart";
import CostBreakdownChart from "../components/analytics/CostBreakdownChart";

const LABOR_RATE_PER_HOUR = 50;

const categorizeMaterial = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('shingle')) return 'Shingles';
  if (lowerName.includes('underlay')) return 'Underlayment';
  if (lowerName.includes('nail')) return 'Nails';
  if (lowerName.includes('flash')) return 'Flashing';
  return 'Miscellaneous';
};

export default function MyAnalytics() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateUserAnalytics = useCallback(async (userProjects) => {
    try {
      // Get all daily updates for user's projects
      const projectIds = userProjects.map(p => p.id);
      const allUpdates = await Promise.all(
        projectIds.map(id => DailyUpdate.filter({ project_id: id }))
      );
      const flatUpdates = allUpdates.flat();

      // Calculate totals across all user projects
      const totalLaborHours = flatUpdates.reduce((sum, u) => sum + (u.hours_worked || 0), 0);
      const laborCost = totalLaborHours * LABOR_RATE_PER_HOUR;

      const allMaterialCosts = flatUpdates.flatMap(u => u.materials_used || []);
      const totalMaterialCost = allMaterialCosts.reduce((sum, m) => sum + (m.cost || 0), 0);
      
      const totalCost = laborCost + totalMaterialCost;
      const totalRevenue = userProjects.reduce((sum, p) => sum + (p.project_budget || 0), 0);
      const netProfit = totalRevenue - totalCost;
      const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Cost breakdown across all projects
      const costBreakdown = allMaterialCosts.reduce((acc, item) => {
        const category = categorizeMaterial(item.material_name);
        acc[category] = (acc[category] || 0) + (item.cost || 0);
        return acc;
      }, {});
      costBreakdown['Labor'] = laborCost;

      const formattedBreakdown = Object.entries(costBreakdown).map(([name, value]) => ({ name, value }));
      
      // Pipeline metrics
      const pipeline = userProjects.reduce((acc, project) => {
        acc[project.project_status] = (acc[project.project_status] || 0) + 1;
        return acc;
      }, {});

      setAnalyticsData({
        totalRevenue,
        totalCost,
        netProfit,
        roi,
        profitMargin,
        costBreakdown: formattedBreakdown,
        pipeline,
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.project_status === 'in_progress').length,
        completedProjects: userProjects.filter(p => p.project_status === 'completed').length,
        avgUpdatesPerProject: userProjects.length > 0 ? flatUpdates.length / userProjects.length : 0
      });
    } catch (error) {
      console.error("Error calculating user analytics:", error);
    }
  }, []); // Empty dependency array for calculateUserAnalytics as it only depends on props/state that are not expected to change frequently or are stable (like categorizeMaterial constant).

  const loadUserProjectsAndAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Get only projects owned by current user
      const userProjects = await Project.filter({ owner_user_id: currentUser.id });
      setProjects(userProjects);
      
      if (userProjects.length > 0) {
        await calculateUserAnalytics(userProjects);
      }
    } catch (error) {
      console.error("Error loading user analytics:", error);
    }
    setIsLoading(false);
  }, [calculateUserAnalytics]); // Dependency on calculateUserAnalytics

  useEffect(() => {
    loadUserProjectsAndAnalytics();
  }, [loadUserProjectsAndAnalytics]); // Dependency on loadUserProjectsAndAnalytics

  const pipelineData = analyticsData ? [
    { name: 'Pipeline', ...analyticsData.pipeline }
  ] : [];

  const metricsData = analyticsData ? {
    revenue: analyticsData.totalRevenue,
    totalCost: analyticsData.totalCost,
    netProfit: analyticsData.netProfit,
    roi: analyticsData.roi,
    profitMargin: analyticsData.profitMargin
  } : null;

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
          <p className="text-gray-600 mt-1">Performance insights across all your projects</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {projects.length} Projects
        </Badge>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-4 bg-gray-200 rounded w-3/4"></div></CardHeader>
              <CardContent><div className="h-8 bg-gray-200 rounded w-1/2"></div></CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-20">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
          <p className="text-gray-500">Create your first project to see analytics here.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{analyticsData?.totalProjects || 0}</div>
                <p className="text-xs text-blue-600 mt-1">{analyticsData?.activeProjects || 0} active</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  ${analyticsData?.totalRevenue?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-green-600 mt-1">Across all projects</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {analyticsData?.roi?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-purple-600 mt-1">Return on investment</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">Total Costs</CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  ${analyticsData?.totalCost?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-orange-600 mt-1">Materials & labor</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">Avg Updates</CardTitle>
                <Clock className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">
                  {analyticsData?.avgUpdatesPerProject?.toFixed(1) || 0}
                </div>
                <p className="text-xs text-indigo-600 mt-1">Per project</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {metricsData && <RevenueCostChart data={metricsData} />}
            </div>
            <div>
              {analyticsData?.costBreakdown && <CostBreakdownChart data={analyticsData.costBreakdown} />}
            </div>
          </div>

          {/* Project Status Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analyticsData?.pipeline || {}).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
