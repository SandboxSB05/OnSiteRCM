import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, Wrench, Calculator } from "lucide-react";

const CREW_HOUR_RATE = 65; // Could be configurable via settings
const SHOW_LABOR_ESTIMATE = false; // Could be feature flag

export default function CostsSummary({ materials = [], hoursWorked = 0 }) {
  const materialsSubtotal = materials.reduce((sum, item) => sum + (item?.extended_cost || 0), 0);
  const laborEstimate = hoursWorked * CREW_HOUR_RATE;
  const dailyTotal = materialsSubtotal + (SHOW_LABOR_ESTIMATE ? laborEstimate : 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Costs Summary</h3>
        <p className="text-sm text-gray-500 mt-1">Auto-computed from today's inputs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Materials Cost */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Materials</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${materialsSubtotal.toFixed(2)}</div>
            <p className="text-xs text-blue-600 mt-1">{materials.length} items</p>
          </CardContent>
        </Card>

        {/* Labor Estimate (if enabled) */}
        {SHOW_LABOR_ESTIMATE && (
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Labor (est.)</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">${laborEstimate.toFixed(2)}</div>
              <p className="text-xs text-green-600 mt-1">{hoursWorked}h × ${CREW_HOUR_RATE}/h</p>
            </CardContent>
          </Card>
        )}

        {/* Other Costs (placeholder) */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Other Costs</CardTitle>
            <Calculator className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">$0.00</div>
            <p className="text-xs text-yellow-600 mt-1">Equipment, travel</p>
          </CardContent>
        </Card>

        {/* Daily Total */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Daily Total (est.)</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${dailyTotal.toFixed(2)}</div>
            <p className="text-xs text-purple-600 mt-1">
              {SHOW_LABOR_ESTIMATE ? 'Materials + Labor' : 'Materials only'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {!SHOW_LABOR_ESTIMATE && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <p className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Labor estimates are disabled. Enable in settings to see full cost breakdown.
          </p>
        </div>
      )}
    </div>
  );
}