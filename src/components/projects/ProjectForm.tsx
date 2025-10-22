
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, DollarSign } from "lucide-react";
import AddCostDialog from "./AddCostDialog";
import ClientSelector from "./ClientSelector";

const PROJECT_TYPES = [
  { value: "residential_replacement", label: "Residential Replacement" },
  { value: "residential_repair", label: "Residential Repair" },
  { value: "commercial_replacement", label: "Commercial Replacement" },
  { value: "commercial_repair", label: "Commercial Repair" },
  { value: "new_construction", label: "New Construction" }
];

const PROJECT_STATUSES = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(project || {
    project_name: "",
    project_type: "residential_replacement",
    project_status: "planning",
    client_id: null,
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    estimated_subtotal: "",
    square_footage: "",
    estimated_start_date: "",
    estimated_completion_date: "",
  });

  const [showCostDialog, setShowCostDialog] = useState(false);
  const [costRefreshKey, setCostRefreshKey] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      estimated_subtotal: formData.estimated_subtotal ? parseFloat(formData.estimated_subtotal) : null,
      square_footage: formData.square_footage ? parseFloat(formData.square_footage) : null
    };
    onSubmit(processedData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCostAdded = () => {
    // Refresh cost list or show success message
    setCostRefreshKey(prev => prev + 1);
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold">
            {project ? 'Edit Project' : 'New Project'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleChange('project_name', e.target.value)}
                  placeholder="e.g., Johnson Residence Roof"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type *</Label>
                <Select value={formData.project_type} onValueChange={(value) => handleChange('project_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Client Information */}
        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Client Information</h3>
          <div>
            <Label htmlFor="client_id">Select Client</Label>
            <ClientSelector
              value={formData.client_id}
              onChange={(id) => handleChange("client_id", id)}
            />
          </div>
        </div>          {/* Project Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address_line1">Street Address *</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => handleChange('address_line1', e.target.value)}
                  placeholder="123 Main St"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => handleChange('address_line2', e.target.value)}
                  placeholder="Apt, Suite, Building (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Austin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="TX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  placeholder="78701"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_subtotal">Estimated Subtotal ($)</Label>
                <Input
                  id="estimated_subtotal"
                  type="number"
                  step="0.01"
                  value={formData.estimated_subtotal}
                  onChange={(e) => handleChange('estimated_subtotal', e.target.value)}
                  placeholder="15000.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="square_footage">Square Footage</Label>
                <Input
                  id="square_footage"
                  type="number"
                  step="0.01"
                  value={formData.square_footage}
                  onChange={(e) => handleChange('square_footage', e.target.value)}
                  placeholder="2500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_status">Status</Label>
                <Select value={formData.project_status} onValueChange={(value) => handleChange('project_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_manager">Project Manager</Label>
                <Input
                  id="project_manager"
                  value={formData.project_manager}
                  onChange={(e) => handleChange('project_manager', e.target.value)}
                  placeholder="Mike Johnson"
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_start_date">Estimated Start Date</Label>
                <Input
                  id="estimated_start_date"
                  type="date"
                  value={formData.estimated_start_date}
                  onChange={(e) => handleChange('estimated_start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_completion_date">Estimated Completion</Label>
                <Input
                  id="estimated_completion_date"
                  type="date"
                  value={formData.estimated_completion_date}
                  onChange={(e) => handleChange('estimated_completion_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Cost Management */}
          {project?.id && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-medium text-gray-900">Project Costs</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCostDialog(true)}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Add Cost
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Track materials, labor, equipment, permits, and other project costs. 
                {!project?.id && " Save the project first to add costs."}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-gray-100 px-6 py-4">
          <div className="flex justify-end gap-3 w-full">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </CardFooter>
      </form>

      {/* Add Cost Dialog */}
      <AddCostDialog
        open={showCostDialog}
        onOpenChange={setShowCostDialog}
        projectId={project?.id || null}
        onCostAdded={handleCostAdded}
      />
    </Card>
  );
}
