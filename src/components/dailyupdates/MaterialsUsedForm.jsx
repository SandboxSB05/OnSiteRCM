import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UNIT_OPTIONS = ["each", "sq_ft", "bundle", "roll", "box", "sheet", "linear_ft", "piece"];

export default function MaterialsUsedForm({ materials, onChange, roofingMaterials }) {
  const safeMaterials = Array.isArray(materials) ? materials : [];
  const safeRoofingMaterials = Array.isArray(roofingMaterials) ? roofingMaterials : [];

  const handleMaterialChange = (index, field, value) => {
    const updatedMaterials = [...safeMaterials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };

    // Auto-calculate extended cost when quantity or unit_cost changes
    if (field === 'quantity' || field === 'unit_cost') {
      const quantity = parseFloat(updatedMaterials[index].quantity) || 0;
      const unitCost = parseFloat(updatedMaterials[index].unit_cost) || 0;
      updatedMaterials[index].extended_cost = quantity * unitCost;
    }

    // Auto-populate material name when selecting from dropdown
    if (field === 'roofing_material_id') {
      const selectedMat = safeRoofingMaterials.find(m => m.id === value);
      if (selectedMat) {
        updatedMaterials[index].material_name_display = selectedMat.name;
        updatedMaterials[index].unit = selectedMat.unit;
        updatedMaterials[index].material_name_text = '';
      }
    }

    onChange(updatedMaterials);
  };

  const handleAddMaterial = () => {
    const newMaterial = {
      roofing_material_id: "",
      material_name_text: "",
      material_name_display: "",
      quantity: "",
      unit: "each",
      unit_cost: "",
      extended_cost: 0
    };
    onChange([...safeMaterials, newMaterial]);
  };

  const handleRemoveMaterial = (index) => {
    const newMaterials = safeMaterials.filter((_, i) => i !== index);
    onChange(newMaterials);
  };

  return (
    <Card className="bg-gray-50/50">
      <CardHeader>
        <CardTitle className="text-lg">Materials Used</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-500 mb-2">
          <div className="col-span-2">Material</div>
          <div>Quantity</div>
          <div>Unit</div>
          <div>Unit Cost</div>
          <div>Extended Cost</div>
          <div></div>
        </div>
        
        {/* Materials List - All Editable */}
        <div className="space-y-2 mb-4">
          {safeMaterials.map((item, index) => (
            <div key={index} className="grid grid-cols-7 gap-2 items-center p-2 bg-white rounded-md border">
              {/* Material Name (Select or Input) */}
              <div className="col-span-2">
                {safeRoofingMaterials.length > 0 ? (
                  <Select 
                    value={item.roofing_material_id || "custom"}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        handleMaterialChange(index, 'roofing_material_id', '');
                        handleMaterialChange(index, 'material_name_display', '');
                      } else {
                        handleMaterialChange(index, 'roofing_material_id', value);
                      }
                    }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Material</SelectItem>
                      {safeRoofingMaterials.map(material => (
                        <SelectItem key={material.id} value={material.id}>{material.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Material Name"
                    value={item.material_name_text || ''}
                    onChange={(e) => handleMaterialChange(index, 'material_name_text', e.target.value)}
                  />
                )}
                
                {/* Custom material input when "Custom Material" is selected */}
                {item.roofing_material_id === '' && safeRoofingMaterials.length > 0 && (
                  <Input
                    className="mt-1"
                    placeholder="Enter custom material name"
                    value={item.material_name_text || ''}
                    onChange={(e) => handleMaterialChange(index, 'material_name_text', e.target.value)}
                  />
                )}
              </div>
              
              {/* Quantity */}
              <div>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity || ''}
                  onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                />
              </div>
              
              {/* Unit */}
              <div>
                <Select 
                  value={item.unit || 'each'} 
                  onValueChange={(value) => handleMaterialChange(index, 'unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Unit Cost */}
              <div>
                <Input
                  type="number"
                  placeholder="$0.00"
                  value={item.unit_cost || ''}
                  onChange={(e) => handleMaterialChange(index, 'unit_cost', e.target.value)}
                />
              </div>
              
              {/* Extended Cost (Read-only) */}
              <div>
                <Input
                  readOnly
                  value={`$${parseFloat(item.extended_cost || 0).toFixed(2)}`}
                  className="bg-gray-100"
                />
              </div>

              {/* Remove Button */}
              <div className="text-right">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveMaterial(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Material Button */}
        <div className="flex justify-center pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddMaterial}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Material
          </Button>
        </div>

        {/* Total Cost Display */}
        {safeMaterials.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
            <div className="text-right">
              <span className="text-sm text-gray-600">Total Material Cost: </span>
              <span className="text-lg font-semibold text-gray-900">
                ${safeMaterials.reduce((sum, item) => sum + (parseFloat(item.extended_cost) || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}