import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Calendar } from "lucide-react";

const COST_CATEGORIES = [
  { value: "materials", label: "Materials" },
  { value: "labor", label: "Labor" },
  { value: "equipment", label: "Equipment" },
  { value: "permits", label: "Permits" },
  { value: "other", label: "Other" }
];

interface AddCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  onCostAdded: () => void;
}

export default function AddCostDialog({ open, onOpenChange, projectId, onCostAdded }: AddCostDialogProps) {
  const [formData, setFormData] = useState({
    category: "materials",
    description: "",
    amount: "",
    isExpected: true,
    date: new Date().toISOString().split('T')[0] // Today's date
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      alert("Please save the project before adding costs.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { Cost } = await import("@/api/supabaseEntities");
      
      const costData = {
        project_id: projectId,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        isExpected: formData.isExpected,
        date: formData.date
      };

      await Cost.create(costData);
      
      // Reset form
      setFormData({
        category: "materials",
        description: "",
        amount: "",
        isExpected: true,
        date: new Date().toISOString().split('T')[0]
      });
      
      onCostAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding cost:", error);
      alert("Failed to add cost. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Add Project Cost
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="e.g., 20 bundles of shingles from Home Depot"
                required
                rows={3}
              />
            </div>

            {/* Amount and Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cost Type */}
            <div className="space-y-2">
              <Label htmlFor="isExpected">Cost Type *</Label>
              <Select 
                value={formData.isExpected.toString()} 
                onValueChange={(value) => handleChange('isExpected', value === 'true')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Expected/Budgeted</SelectItem>
                  <SelectItem value="false">Unexpected/Additional</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Track whether this cost was planned in your budget
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Cost"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
