
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

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
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" }
];

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(project || {
    project_name: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    project_address: "",
    project_type: "residential_replacement",
    estimated_start_date: "", // Renamed from start_date
    estimated_end_date: "",   // Renamed from estimated_completion
    project_budget: "",
    project_status: "planning",
    crew_size: "",
    square_footage: "",
    project_manager: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      project_budget: formData.project_budget ? parseFloat(formData.project_budget) : null,
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : null,
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleChange('client_email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone">Phone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => handleChange('client_phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_address">Project Address *</Label>
                <Input
                  id="project_address"
                  value={formData.project_address}
                  onChange={(e) => handleChange('project_address', e.target.value)}
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_start_date">Start Date</Label>
                <Input
                  id="estimated_start_date"
                  type="date"
                  value={formData.estimated_start_date}
                  onChange={(e) => handleChange('estimated_start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_end_date">Estimated Completion</Label>
                <Input
                  id="estimated_end_date"
                  type="date"
                  value={formData.estimated_end_date}
                  onChange={(e) => handleChange('estimated_end_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_budget">Budget ($)</Label>
                <Input
                  id="project_budget"
                  type="number"
                  step="0.01"
                  value={formData.project_budget}
                  onChange={(e) => handleChange('project_budget', e.target.value)}
                  placeholder="15000"
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
                <Label htmlFor="crew_size">Crew Size</Label>
                <Input
                  id="crew_size"
                  type="number"
                  value={formData.crew_size}
                  onChange={(e) => handleChange('crew_size', e.target.value)}
                  placeholder="4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="square_footage">Square Footage</Label>
                <Input
                  id="square_footage"
                  type="number"
                  value={formData.square_footage}
                  onChange={(e) => handleChange('square_footage', e.target.value)}
                  placeholder="2500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
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
    </Card>
  );
}
