import React, { useState, useEffect } from 'react';
import { Project, ClientUpdate } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, MessageSquare, CheckCircle, Trash2, Mail, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SendEmail } from "@/api/integrations";
import PhotoUploader from '../components/dailyupdates/PhotoUploader';
import { format } from 'date-fns';

// Simple component for repeatable material costs
const MaterialCostsForm = ({ materials, onChange }) => {
  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    onChange(newMaterials);
  };

  const handleAddMaterial = () => {
    onChange([...materials, { description: '', cost: '' }]);
  };

  const handleRemoveMaterial = (index) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    onChange(newMaterials);
  };

  return (
    <div className="space-y-2">
      {materials.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Material Description"
            value={item.description}
            onChange={(e) => handleMaterialChange(index, 'description', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Cost"
            value={item.cost}
            onChange={(e) => handleMaterialChange(index, 'cost', e.target.value)}
            className="w-32"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMaterial(index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={handleAddMaterial} className="mt-2">
        Add Material
      </Button>
    </div>
  );
};


export default function ClientUpdates() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({
    update_date: new Date().toISOString().split('T')[0],
    description: '',
    time_cost_labor: '',
    time_cost_notes: '',
    additional_materials: [],
    total_cost_to_date: '',
    total_paid: '',
    total_due: '',
    photos: [],
    videos: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [generatedUpdate, setGeneratedUpdate] = useState(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendToEmail, setSendToEmail] = useState("");
  const [emailTemplate, setEmailTemplate] = useState(null); // Changed from aiGeneratedMessage
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        setSendToEmail(project.client_email || "");
      }
    }
  }, [selectedProjectId, projects]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const allProjects = await Project.list("-created_date");
      setProjects(Array.isArray(allProjects) ? allProjects : []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast({ title: "Please select a project.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        project_id: selectedProjectId,
        time_cost_labor: formData.time_cost_labor ? parseFloat(formData.time_cost_labor) : null,
        additional_materials: formData.additional_materials.map(m => ({ ...m, cost: m.cost ? parseFloat(m.cost) : 0 })),
        total_cost_to_date: formData.total_cost_to_date ? parseFloat(formData.total_cost_to_date) : null,
        total_paid: formData.total_paid ? parseFloat(formData.total_paid) : null,
        total_due: formData.total_due ? parseFloat(formData.total_due) : null,
      };
      const newUpdate = await ClientUpdate.create(dataToSubmit);
      setGeneratedUpdate(newUpdate);
      toast({ title: "Client update generated successfully!", variant: "success" });
      setEmailTemplate(null); // Clear previous email template when a new update is generated
    } catch (error) {
      console.error("Error creating client update:", error);
      toast({ title: "Failed to generate update.", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  const getUpdateLink = () => {
      if (!generatedUpdate) return "";
      const url = new URL(window.location.origin);
      url.pathname = createPageUrl(`ClientUpdateDetail`);
      url.searchParams.set('id', generatedUpdate.id);
      return url.toString();
  };
  
  const handleSendEmail = async () => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project || !generatedUpdate || !sendToEmail || !emailTemplate) {
        toast({ title: "Please generate email template first.", variant: "destructive" });
        return;
    }

    setIsSendingEmail(true);
    try {
        await SendEmail({
            to: sendToEmail,
            subject: emailTemplate.subject,
            body: emailTemplate.body,
            from_name: "OnSite Updates"
        });

        toast({ title: "Email sent successfully!", variant: "success" });
        setShowSendDialog(false);
    } catch(error) {
        console.error("Error sending email:", error);
        toast({ title: "Failed to send email.", description: error.message, variant: "destructive" });
    } finally {
        setIsSendingEmail(false);
    }
  };

  // Original handleCopySms (now functions as a fallback if AI isn't used)
  const handleCopySms = () => {
      const project = projects.find(p => p.id === selectedProjectId);
      if (!project || !generatedUpdate) {
        toast({ title: "Missing project or update details to copy SMS.", variant: "destructive" });
        return;
      }
      
      const updateLink = getUpdateLink();
      const smsBody = `Hi ${project.client_name}, today's project update is ready. View full details, photos, and videos here: ${updateLink}`;
      navigator.clipboard.writeText(smsBody);
      toast({ title: "Copied to clipboard!", description: "Paste the message into your SMS app."});
  };

  const generateEmailTemplate = () => {
    if (!selectedProjectId || !generatedUpdate) {
      toast({ title: "Please generate an update first", variant: "destructive" });
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) {
      toast({ title: "Project not found.", variant: "destructive" });
      return;
    }

    const updateLink = getUpdateLink();
    
    // Build additional costs HTML
    let additionalCostsHTML = '';
    const hasAdditionalCosts = (generatedUpdate.time_cost_labor && generatedUpdate.time_cost_labor > 0) || 
                               (generatedUpdate.additional_materials && generatedUpdate.additional_materials.some(m => m.cost > 0));
    
    if (hasAdditionalCosts) {
      additionalCostsHTML = '<h3 style="color: #1e40af; margin-top: 20px; margin-bottom: 10px;">Additional Project Costs</h3><ul style="list-style: none; padding: 0;">';
      
      if (generatedUpdate.time_cost_labor && generatedUpdate.time_cost_labor > 0) {
        additionalCostsHTML += `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
          <span>${generatedUpdate.time_cost_notes || 'Additional Labor'}</span>
          <span style="font-weight: 600;">$${generatedUpdate.time_cost_labor.toFixed(2)}</span>
        </li>`;
      }
      
      generatedUpdate.additional_materials?.forEach(item => {
        if (item.cost > 0) {
          additionalCostsHTML += `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
            <span>${item.description}</span>
            <span style="font-weight: 600;">$${item.cost.toFixed(2)}</span>
          </li>`;
        }
      });
      
      additionalCostsHTML += '</ul>';
    }

    const subject = `Project Update - ${project.project_name}, ${format(new Date(generatedUpdate.update_date), 'MMM d, yyyy')}`;
    
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h2 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">Project Update</h2>
        
        <p>Hi ${project.client_name},</p>
        
        <p>Here is the latest update for your project, <strong>${project.project_name}</strong>.</p>
        
        <h3 style="color: #1e40af; margin-top: 20px;">Work Summary</h3>
        <p style="background-color: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
          ${generatedUpdate.description}
        </p>
        
        ${additionalCostsHTML}
        
        <h3 style="color: #1e40af; margin-top: 20px; margin-bottom: 10px;">Financial Summary</h3>
        <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span>Total Cost to Date:</span>
            <span style="font-weight: 600;">$${(generatedUpdate.total_cost_to_date || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span>Total Paid:</span>
            <span style="font-weight: 600; color: #059669;">$${(generatedUpdate.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #2563eb; margin-top: 8px; padding-top: 12px;">
            <span style="font-weight: 600;">Remaining Balance:</span>
            <span style="font-weight: 700; color: #2563eb; font-size: 18px;">$${(generatedUpdate.total_due || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        ${generatedUpdate.photos && generatedUpdate.photos.length > 0 ? '<p style="margin-top: 20px;">View photos and full details using the link below:</p>' : ''}
        
        <p style="margin-top: 20px;">
          <a href="${updateLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View Full Update
          </a>
        </p>
        
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          Best regards,<br/>
          <strong>OnSite | Roofing Contractor Management</strong>
        </p>
      </div>
    `;

    setEmailTemplate({ subject, body });
    toast({ title: "Email template generated!", description: "Review and edit before sending." });
  };


  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <>
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Client Update</CardTitle>
            <p className="text-gray-500">Generate a shareable update for your client.</p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project_id">Project *</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId} required>
                    <SelectTrigger id="project_id"><SelectValue placeholder="Select a project..." /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="update_date">Update Date</Label>
                  <Input id="update_date" type="date" value={formData.update_date} onChange={(e) => handleInputChange('update_date', e.target.value)} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Brief Description *</Label>
                <Textarea id="description" placeholder="What was done today?" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Additional Time/Labor Cost</Label>
                <div className="flex gap-2">
                  <Input type="number" className="w-40" placeholder="Labor Cost" value={formData.time_cost_labor} onChange={(e) => handleInputChange('time_cost_labor', e.target.value)} />
                  <Input placeholder="Notes (e.g., 2 hrs fascia repair)" value={formData.time_cost_notes} onChange={(e) => handleInputChange('time_cost_notes', e.target.value)} />
                </div>
              </div>
              
              <div>
                  <Label>Additional Material Costs</Label>
                  <MaterialCostsForm materials={formData.additional_materials} onChange={(mats) => handleInputChange('additional_materials', mats)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <Label htmlFor="total_cost_to_date">Total Cost to Date</Label>
                      <Input id="total_cost_to_date" type="number" placeholder="$" value={formData.total_cost_to_date} onChange={(e) => handleInputChange('total_cost_to_date', e.target.value)} />
                  </div>
                  <div>
                      <Label htmlFor="total_paid">Total Paid</Label>
                      <Input id="total_paid" type="number" placeholder="$" value={formData.total_paid} onChange={(e) => handleInputChange('total_paid', e.target.value)} />
                  </div>
                  <div>
                      <Label htmlFor="total_due">Total Due</Label>
                      <Input id="total_due" type="number" placeholder="$" value={formData.total_due} onChange={(e) => handleInputChange('total_due', e.target.value)} />
                  </div>
              </div>
              
              <div>
                  <Label>Photos</Label>
                  <PhotoUploader photos={formData.photos} onChange={(p) => handleInputChange('photos', p)} />
              </div>
              
              <div>
                  <Label>Videos</Label>
                  <p className="text-sm text-gray-500 mb-2">Video uploads coming soon. For now, please use links from YouTube, etc.</p>
                  {/* Placeholder for video uploader */}
              </div>

            </CardContent>
            <CardFooter className="border-t p-6">
                <Button type="submit" disabled={isSubmitting || !selectedProjectId}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  {isSubmitting ? 'Generating...' : 'Generate Update'}
                </Button>
            </CardFooter>
          </form>
          
          {generatedUpdate && (
              <CardFooter className="bg-green-50 border-t p-6 flex flex-col items-start gap-4">
                  <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5"/>
                      <h3 className="font-semibold text-lg">Update Generated!</h3>
                  </div>
                  <p className="text-sm text-gray-700">Your client update is ready. Generate an AI message or share directly.</p>
                  
                  {/* Email Template Generator */}
                  <div className="w-full">
                    <Button 
                      onClick={generateEmailTemplate} 
                      disabled={!selectedProjectId || !generatedUpdate}
                      className="mb-3"
                      variant="outline"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Generate Email
                    </Button>
                    
                    {emailTemplate && (
                      <div className="bg-white p-4 rounded-lg border mb-4 space-y-3">
                        <h4 className="font-medium mb-2">Email Preview:</h4>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-semibold text-gray-600">Subject:</Label>
                            <p className="text-sm font-medium mt-1 p-2 bg-gray-50 rounded border">{emailTemplate.subject}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-gray-600">Email Body:</Label>
                            <div 
                              className="mt-1 p-4 bg-gray-50 rounded border overflow-auto max-h-96"
                              dangerouslySetInnerHTML={{ __html: emailTemplate.body }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                      <Button onClick={() => setShowSendDialog(true)} disabled={!emailTemplate}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email
                      </Button>
                      <Button variant="outline" onClick={handleCopySms} disabled={!generatedUpdate}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Copy for SMS
                      </Button>
                  </div>
              </CardFooter>
          )}
        </Card>
      </div>
    </div>
    <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Update to Client</DialogTitle>
            <DialogDescription>
              Confirm the recipient's email address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
              <Label htmlFor="send-email">Recipient Email</Label>
              <Input
                id="send-email"
                type="email"
                value={sendToEmail}
                onChange={(e) => setSendToEmail(e.target.value)}
                placeholder="client@example.com"
                required
                disabled={isSendingEmail}
              />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={isSendingEmail}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={!sendToEmail || isSendingEmail}>
              {isSendingEmail ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                  <Send className="w-4 h-4 mr-2" />
              )}
              {isSendingEmail ? 'Sending...' : 'Confirm & Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
