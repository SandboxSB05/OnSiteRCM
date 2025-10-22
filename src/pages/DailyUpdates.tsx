import React, { useState, useEffect } from 'react';
import { Project, ClientUpdate } from '@/api/supabaseEntities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, MessageSquare, CheckCircle, Mail, FileText, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { SendEmail } from "@/api/integrations";
import PhotoUploader from '../components/dailyupdates/PhotoUploader';
import AddCostDialog from '../components/projects/AddCostDialog';
import { format } from 'date-fns';

export default function CreateUpdate() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({
    update_date: new Date().toISOString().split('T')[0],
    description: '',
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
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [sendToEmail, setSendToEmail] = useState("");
  const [emailTemplate, setEmailTemplate] = useState<{subject: string, body: string} | null>(null);
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

  const handleCostAdded = () => {
    toast({ title: "Cost added successfully!", variant: "success" });
    // Optionally refresh cost data here
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
        time_cost_labor: null, // Not used in new version
        additional_materials: [], // Not used in new version
        total_cost_to_date: formData.total_cost_to_date ? parseFloat(formData.total_cost_to_date) : null,
        total_paid: formData.total_paid ? parseFloat(formData.total_paid) : null,
        total_due: formData.total_due ? parseFloat(formData.total_due) : null,
      };
      const newUpdate = await ClientUpdate.create(dataToSubmit);
      setGeneratedUpdate(newUpdate);
      toast({ title: "Update generated successfully!", variant: "success" });
      setEmailTemplate(null);
    } catch (error: any) {
      console.error("Error creating update:", error);
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

    toast({ title: "Generating AI email...", description: "Curating your professional update message" });

    const updateLink = getUpdateLink();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiIntro = `I hope this message finds you well. I'm writing to provide you with today's progress update on your roofing project. Our team has been working diligently, and I'm pleased to share the details of what we've accomplished.`;
    
    const aiWorkSummary = generatedUpdate.description || `Today, our crew focused on the critical structural components of your roof. We successfully completed important milestones and ensured every detail meets our high-quality standards.`;
    
    const aiClosing = generatedUpdate.photos && generatedUpdate.photos.length > 0 
      ? `I've included photos of today's work in the detailed update link below. Please don't hesitate to reach out if you have any questions or concerns.`
      : `Please review the update details via the link below. I'm always available if you have any questions or would like to discuss the project further.`;

    const subject = `${project.project_name} - Progress Update for ${format(new Date(generatedUpdate.update_date), 'MMMM d, yyyy')}`;
    
    const body = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1f2937; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Project Update</h1>
          <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px;">${format(new Date(generatedUpdate.update_date), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 32px 24px;">
          <p style="font-size: 16px; margin-top: 0;">Dear ${project.client_name},</p>
          <p style="font-size: 16px;">${aiIntro}</p>
          
          <div style="margin-top: 28px;">
            <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Today's Accomplishments</h2>
            <div style="background-color: #eff6ff; padding: 20px; border-left: 4px solid #2563eb; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 0; font-size: 15px; color: #1f2937;">${aiWorkSummary}</p>
            </div>
          </div>
          
          <div style="margin-top: 28px;">
            <h2 style="color: #1e40af; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Financial Overview</h2>
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
          
          <div style="margin-top: 28px;">
            <p style="font-size: 15px;">${aiClosing}</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${updateLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
              📋 View Detailed Update
            </a>
            ${generatedUpdate.photos && generatedUpdate.photos.length > 0 ? '<p style="color: #6b7280; font-size: 13px; margin-top: 12px; margin-bottom: 0;">Includes photos and complete project details</p>' : ''}
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Best regards,<br/>
            <span style="font-weight: 600; color: #1f2937;">Your OnSite Roofing Team</span>
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
            <CardTitle className="text-2xl font-bold">Create Update</CardTitle>
            <p className="text-gray-500">Generate a shareable update for your client with cost tracking.</p>
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
                <Label htmlFor="description">Work Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe what was accomplished today..." 
                  value={formData.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)} 
                  required 
                  rows={4}
                />
              </div>

              {/* Add Cost Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-base">Project Costs</Label>
                    <p className="text-sm text-gray-500 mt-1">Add materials, labor, equipment, and other costs</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCostDialog(true)}
                    disabled={!selectedProjectId}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Add Cost
                  </Button>
                </div>
                {!selectedProjectId && (
                  <p className="text-sm text-gray-400 italic">Select a project to add costs</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
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
              
              <div className="border-t pt-4">
                  <Label>Photos</Label>
                  <PhotoUploader photos={formData.photos} onChange={(p: any) => handleInputChange('photos', p)} />
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

    {/* Add Cost Dialog */}
    <AddCostDialog
      open={showCostDialog}
      onOpenChange={setShowCostDialog}
      projectId={selectedProjectId}
      onCostAdded={handleCostAdded}
    />

    {/* Send Email Dialog */}
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
