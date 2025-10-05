import React, { useState, useEffect, useMemo } from 'react';
import { DailyUpdate } from "@/api/entities";
import { Loader2 } from "lucide-react";
import CustomerAnalytics from "./CustomerAnalytics";
import CustomerProjectList from "./CustomerProjectList";

const LABOR_RATE_PER_HOUR = 50; // Assumption for labor cost calculation

const categorizeMaterial = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('shingle')) return 'Shingles';
    if (lowerName.includes('underlay')) return 'Underlayment';
    if (lowerName.includes('nail')) return 'Nails';
    if (lowerName.includes('flash')) return 'Flashing';
    return 'Miscellaneous';
};

export default function CustomerDetailView({ customer, projects }) {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (customer.projectIds.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const allUpdates = await DailyUpdate.filter({ project_id__in: customer.projectIds });
        setUpdates(allUpdates);
      } catch (error) {
        console.error("Error fetching updates for customer:", error);
      }
      setIsLoading(false);
    };

    fetchUpdates();
  }, [customer]);

  const analyticsData = useMemo(() => {
    if (isLoading) return null;
    
    const totalRevenue = projects.reduce((sum, p) => sum + (p.project_budget || 0), 0);
    const totalLaborHours = updates.reduce((sum, u) => sum + (u.hours_worked || 0), 0);
    const laborCost = totalLaborHours * LABOR_RATE_PER_HOUR;

    const materialCosts = updates.flatMap(u => u.materials_used || []);
    const totalMaterialCost = materialCosts.reduce((sum, m) => sum + (m.cost || 0), 0);
    
    const totalCost = laborCost + totalMaterialCost;
    const netProfit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const costBreakdownMap = materialCosts.reduce((acc, item) => {
        const category = categorizeMaterial(item.material_name);
        acc[category] = (acc[category] || 0) + (item.cost || 0);
        return acc;
    }, {});
    costBreakdownMap['Labor'] = laborCost;

    const costBreakdown = Object.entries(costBreakdownMap).map(([name, value]) => ({ name, value }));
    
    return {
      revenue: totalRevenue,
      totalCost,
      netProfit,
      roi,
      profitMargin,
      costBreakdown,
    };
  }, [isLoading, projects, updates]);
  
  if (isLoading) {
      return (
          <div className="flex items-center justify-center p-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {analyticsData && <CustomerAnalytics data={analyticsData} />}
      <CustomerProjectList projects={projects} />
    </div>
  );
}