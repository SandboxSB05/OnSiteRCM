
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Edit, 
  Send, 
  Loader2, 
  User, 
  FileText, 
  Camera,
  Wrench, // Changed from DollarSign to Wrench
  Cloud,
  Clock,
  Percent,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { DailyUpdate } from "@/api/supabaseEntities";
import { SendEmail } from "@/api/integrations";

export default function UpdateDetailsModal({ update, project, onClose, onEdit, onUpdate }) {
  const [isSending, setIsSending] = useState(false);

  const handleSendUpdate = async () => {
    if (!update.ai_summary) {
      alert("AI summary is missing.");
      return;
    }
    setIsSending(true);
    try {
      const emailBody = `
        <p>${update.ai_summary}</p>
        ${(update.progress_photos || []).length > 0 ? `
          <p>You can view the latest photos of our progress here:</p>
          ${update.progress_photos.map(url => `<img src="${url}" alt="Progress Photo" style="max-width: 100%; height: auto; margin-bottom: 10px; border-radius: 8px;" />`).join('')}
        ` : ''}
        <p>Thank you,<br/>The RoofTracker Pro Team</p>
      `;
      
      await SendEmail({
        to: "henrymadsen02@gmail.com", // This should be dynamic in a real app
        subject: `Update for your project: ${project.project_name}`,
        body: emailBody
      });
      
      await DailyUpdate.update(update.id, { sent_to_customer: true });
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error("Error sending update:", error);
      alert("Failed to send update. Please try again.");
    }
    setIsSending(false);
  };
  
  const totalMaterialCost = (update.materials_used || []).reduce((sum, item) => sum + (item.extended_cost || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.project_name}</DialogTitle>
          <div className="text-sm text-gray-500">
            Daily Update for {format(new Date(update.update_date), 'MMMM d, yyyy')}
          </div>
        </DialogHeader>

        <Tabs defaultValue="customer_view" className="mt-4">
          <TabsList>
            <TabsTrigger value="customer_view"><User className="w-4 h-4 mr-2" />Customer View</TabsTrigger>
            <TabsTrigger value="internal_notes"><FileText className="w-4 h-4 mr-2" />Internal Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer_view" className="mt-4 pr-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Customer Summary</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{update.ai_summary || "No AI summary generated."}</p>
              
              {update.progress_photos && update.progress_photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Camera /> Progress Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {update.progress_photos.map((url, i) => (
                      <a href={url} target="_blank" rel="noopener noreferrer" key={i}>
                        <img src={url} alt={`Progress ${i}`} className="rounded-md object-cover aspect-square hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="internal_notes" className="mt-4 pr-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Manager's Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{update.pm_description}</p>
              </div>

              {update.issues_encountered && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-orange-600"><AlertTriangle /> Issues Encountered</h3>
                  <p className="text-gray-700 bg-orange-50 p-3 rounded-md whitespace-pre-wrap">{update.issues_encountered}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4"> {/* Changed md:grid-cols-4 to md:grid-cols-3 */}
                  <div className="flex items-center gap-2"><Cloud className="w-4 h-4 text-blue-500" /><div><div className="text-xs text-gray-500">Weather</div><div className="font-medium">{update.weather_conditions?.replace('_', ' ')}</div></div></div> {/* Added optional chaining */}
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /><div><div className="text-xs text-gray-500">Hours</div><div className="font-medium">{update.hours_worked}</div></div></div>
                  <div className="flex items-center gap-2"><Percent className="w-4 h-4 text-green-500" /><div><div className="text-xs text-gray-500">Completion</div><div className="font-medium">{update.completion_percentage}%</div></div></div>
              </div>
              
              {update.materials_used && update.materials_used.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Wrench/> Materials Used</h3> {/* Changed icon to Wrench */}
                  <div className="border rounded-md">
                    <div className="bg-gray-50 p-2 text-xs text-gray-500 grid grid-cols-12 gap-2 font-medium">
                      <div className="col-span-4">Material</div>
                      <div className="col-span-2 text-right">Qty</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-2 text-right">Unit Cost</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>
                    {(update.materials_used || []).map((item, i) => (
                      <div key={i} className={`grid grid-cols-12 gap-2 items-center p-2 text-sm ${i < update.materials_used.length - 1 ? 'border-b' : ''}`}>
                        <span className="col-span-4 font-medium">{item.material_name_display || item.material_name_text}</span>
                        <span className="col-span-2 text-right">{item.quantity}</span>
                        <span className="col-span-2">{item.unit}</span>
                        <span className="col-span-2 text-right">${item.unit_cost?.toFixed(2) || '0.00'}</span>
                        <span className="col-span-2 text-right font-semibold">${item.extended_cost?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-2 font-bold bg-gray-50 border-t">
                        <span>Total Cost</span>
                        <span>${totalMaterialCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center w-full">
            <div>
              {update.sent_to_customer ? (
                <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent to customer</Badge>
              ) : (
                <Badge variant="outline" className="text-orange-600 border-orange-200"><AlertCircle className="w-3 h-3 mr-1" />Not sent yet</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}><X className="w-4 h-4 mr-2" />Close</Button>
              <Button variant="outline" onClick={() => { onEdit(update); onClose(); }}><Edit className="w-4 h-4 mr-2" />Edit</Button>
              {!update.sent_to_customer && (
                <Button onClick={handleSendUpdate} disabled={isSending}>
                  {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send to Customer
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
