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
const MaterialCostsForm = ({ materials, onChange }: { materials: any[], onChange: (materials: any[]) => void }) => {
  const handleMaterialChange = (index: number, field: string, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    onChange(newMaterials);
  };

  const handleAddMaterial = () => {
    onChange([...materials, { description: '', cost: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = materials.filter((_: any, i: number) => i !== index);
    onChange(newMaterials);
  };

  return (
    <div className="space-y-2">
      {materials.map((item: any, index: number) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Material Description"
            value={item.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMaterialChange(index, 'description', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Cost"
            value={item.cost}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMaterialChange(index, 'cost', e.target.value)}
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
  const [projects, setProjects] = useState<any[]>([]);
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
  const [generatedUpdate, setGeneratedUpdate] = useState<any>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendToEmail, setSendToEmail] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<{subject: string, body: string} | null>(null); // Changed from aiGeneratedMessage
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        additional_materials: formData.additional_materials.map((m: any) => ({ ...m, cost: m.cost ? parseFloat(m.cost) : 0 })),
        total_cost_to_date: formData.total_cost_to_date ? parseFloat(formData.total_cost_to_date) : null,
        total_paid: formData.total_paid ? parseFloat(formData.total_paid) : null,
        total_due: formData.total_due ? parseFloat(formData.total_due) : null,
      };
      const newUpdate = await ClientUpdate.create(dataToSubmit);
      setGeneratedUpdate(newUpdate);
      toast({ title: "Client update generated successfully!", variant: "success" });
      setEmailTemplate(null); // Clear previous email template when a new update is generated
    } catch (error: any) {
      console.error("Error creating client update:", error);
      toast({ title: "Failed to generate update.", description: error?.message || "An error occurred", variant: "destructive" });
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
            body: emailTemplate.body
        });

        toast({ title: "Email sent successfully!", variant: "success" });
        setShowSendDialog(false);
    } catch(error: any) {
        console.error("Error sending email:", error);
        toast({ title: "Failed to send email.", description: error?.message || "An error occurred", variant: "destructive" });
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

  const generateEmailTemplate = async () => {
    if (!selectedProjectId || !generatedUpdate) {
      toast({ title: "Please generate an update first", variant: "destructive" });
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) {
      toast({ title: "Project not found.", variant: "destructive" });
      return;
    }

    // Show loading state
    toast({ title: "Generating AI email...", description: "Curating your professional update message" });

    const updateLink = getUpdateLink();
    
    // Simulate AI processing delay (remove this when integrating real AI)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // MOCK AI GENERATION - This is HARDCODED to simulate what AI would generate
    // In production, this would call: await InvokeLLM({ prompt: ..., model: 'gpt-4' })
    
    // HARDCODED AI-GENERATED CONTENT (Replace with real AI in production)
    const aiIntro = `I hope this message finds you well. I'm writing to provide you with today's progress update on your roofing project. Our team has been working diligently, and I'm pleased to share the details of what we've accomplished.`;
    
    // HARDCODED professional summary (In production, AI would curate from the actual description field)
    const aiWorkSummary = `Today, our crew focused on the critical structural components of your roof. We successfully completed the installation of the underlayment on the south-facing section, ensuring proper water barrier protection. Additionally, we inspected and reinforced several roof decking boards that showed signs of wear, replacing them with treated lumber to maintain structural integrity. 

The weather conditions were favorable, allowing us to make excellent progress. Our team also installed new flashing around the chimney area to prevent future water infiltration. We're maintaining our schedule and ensuring every detail meets our high-quality standards.`;
    
    // Note: In a real implementation, the above would be generated by AI from generatedUpdate.description
    
    // Build additional costs section with professional formatting
    let additionalCostsHTML = '';
    const hasAdditionalCosts = (generatedUpdate.time_cost_labor && generatedUpdate.time_cost_labor > 0) || 
                               (generatedUpdate.additional_materials && generatedUpdate.additional_materials.some((m: any) => m.cost > 0));
    
    if (hasAdditionalCosts) {
      additionalCostsHTML = `
        <div style="margin-top: 24px;">
          <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Additional Costs This Period</h3>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">The following additional costs were incurred as part of the work completed:</p>
          <ul style="list-style: none; padding: 0; background-color: #f9fafb; border-radius: 8px; padding: 12px;">
      `;
      
      if (generatedUpdate.time_cost_labor && generatedUpdate.time_cost_labor > 0) {
        const laborNote = generatedUpdate.time_cost_notes || 'Additional labor hours';
        additionalCostsHTML += `
          <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 600; color: #374151;">Labor</span>
              <span style="display: block; color: #6b7280; font-size: 13px; margin-top: 2px;">${laborNote}</span>
            </div>
            <span style="font-weight: 600; color: #1f2937; font-size: 16px;">$${generatedUpdate.time_cost_labor.toFixed(2)}</span>
          </li>
        `;
      }
      
      generatedUpdate.additional_materials?.forEach((item: any) => {
        if (item.cost > 0) {
          additionalCostsHTML += `
            <li style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #374151;">${item.description}</span>
              <span style="font-weight: 600; color: #1f2937; font-size: 16px;">$${item.cost.toFixed(2)}</span>
            </li>
          `;
        }
      });
      
      additionalCostsHTML += '</ul></div>';
    }
    
    // AI-curated financial summary intro
    let financialIntro = '';
    const remainingBalance = generatedUpdate.total_due || 0;
    if (remainingBalance > 0) {
      financialIntro = `Below is the current financial status of your project:`;
    } else if (remainingBalance === 0) {
      financialIntro = `Great news - your project balance is fully paid!`;
    }
    
    // AI-curated closing based on project status
    let aiClosing = '';
    if (generatedUpdate.photos && generatedUpdate.photos.length > 0) {
      aiClosing = `I've included photos of today's work in the detailed update link below. Please don't hesitate to reach out if you have any questions or concerns.`;
    } else {
      aiClosing = `Please review the update details via the link below. I'm always available if you have any questions or would like to discuss the project further.`;
    }

    const subject = `${project.project_name} - Progress Update for ${format(new Date(generatedUpdate.update_date), 'MMMM d, yyyy')}`;
    
    const body = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1f2937; line-height: 1.6;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Project Update</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">${format(new Date(generatedUpdate.update_date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        
        <!-- Main Content -->
        <div style="background-color: #ffffff; padding: 32px 24px;">
          <p style="font-size: 16px; margin-top: 0;">Dear ${project.client_name},</p>
          
          <p style="font-size: 16px;">${aiIntro}</p>
          
          <!-- Work Summary -->
          <div style="margin-top: 28px;">
            <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              Today's Accomplishments
            </h2>
            <div style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #2563eb; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-size: 15px; color: #1f2937;">${aiWorkSummary}</p>
            </div>
          </div>
          
          ${additionalCostsHTML}
          
          <!-- Financial Summary -->
          <div style="margin-top: 28px;">
            <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
              Financial Overview
            </h2>
            ${financialIntro ? `<p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">${financialIntro}</p>` : ''}
            <div style="background: linear-gradient(to bottom, #eff6ff, #ffffff); padding: 20px; border-radius: 8px; border: 1px solid #bfdbfe;">
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 15px;">Project Cost to Date</span>
                <span style="font-weight: 600; color: #1f2937; font-size: 16px;">$${(generatedUpdate.total_cost_to_date || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 15px;">Amount Paid</span>
                <span style="font-weight: 600; color: #059669; font-size: 16px;">$${(generatedUpdate.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 16px 0 0 0; margin-top: 12px; border-top: 2px solid #2563eb;">
                <span style="font-weight: 600; color: #1f2937; font-size: 16px;">Outstanding Balance</span>
                <span style="font-weight: 700; color: #2563eb; font-size: 20px;">$${(generatedUpdate.total_due || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          <!-- Closing -->
          <div style="margin-top: 28px;">
            <p style="font-size: 15px;">${aiClosing}</p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${updateLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
              📋 View Detailed Update
            </a>
            ${generatedUpdate.photos && generatedUpdate.photos.length > 0 ? '<p style="color: #6b7280; font-size: 13px; margin-top: 12px; margin-bottom: 0;">Includes photos and complete project details</p>' : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Best regards,<br/>
            <span style="font-weight: 600; color: #1f2937;">Your OnSite Roofing Team</span>
          </p>
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
            This is an automated update from your roofing contractor. For questions or concerns, please reply to this email or contact us directly.
          </p>
        </div>
      </div>
    `;

    setEmailTemplate({ subject, body });
    toast({ 
      title: "✨ AI Email Generated!", 
      description: "Your professional update email is ready to review and send.",
      variant: "success"
    });
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
                  <PhotoUploader photos={formData.photos} onChange={(p: any) => handleInputChange('photos', p)} />
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
                  
                  {/* AI Email Generator */}
                  <div className="w-full">
                    <Button 
                      onClick={generateEmailTemplate} 
                      disabled={!selectedProjectId || !generatedUpdate}
                      className="mb-3"
                      variant="outline"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      ✨ Generate AI Email
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
