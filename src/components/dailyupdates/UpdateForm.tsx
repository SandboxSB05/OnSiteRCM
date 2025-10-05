
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save, Wand2, Send, Loader2, Brain, Copy, Mail, CheckCircle } from "lucide-react"; // Updated lucide-react imports
import { InvokeLLM, SendEmail } from "@/api/integrations";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Added Dialog imports

import PhotoUploader from "./PhotoUploader";
import MaterialsUsedForm from "./MaterialsUsedForm";

const WEATHER_OPTIONS = [
  { value: "sunny", label: "☀️ Sunny" },
  { value: "partly_cloudy", label: "⛅ Partly Cloudy" },
  { value: "overcast", label: "☁️ Overcast" },
  { value: "light_rain", label: "🌦️ Light Rain" },
  { value: "heavy_rain", label: "🌧️ Heavy Rain" },
  { value: "windy", label: "💨 Windy" }
];

// Define a default form data structure
const DEFAULT_FORM_DATA = { // Renamed from defaultFormData to DEFAULT_FORM_DATA
    project_id: "",
    update_date: new Date().toISOString().split('T')[0],
    pm_description: "",
    weather_conditions: "sunny",
    hours_worked: "",
    completion_percentage: "",
    progress_photos: [],
    materials_used: [],
    issues_encountered: "",
    ai_summary: "", 
    ai_issues_analysis: null,
    sent_to_customer: false,
};

export default function UpdateForm({ update, projects, onSubmit, onCancel }) {
  const { toast } = useToast();
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  
  // Initialize state using the default form data
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA); // Used DEFAULT_FORM_DATA
  const [materials, setMaterials] = useState([]);
  const [roofingMaterials, setRoofingMaterials] = useState([]); // Added roofingMaterials as per outline
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAISection, setShowAISection] = useState(false); // Kept showAISection state as it's used
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendToEmail, setSendToEmail] = useState(""); // New state for editable recipient email

  // Effect to initialize/reset form data and materials when 'update' or 'projects' props change
  useEffect(() => {
      const initialData = { ...DEFAULT_FORM_DATA }; // Used DEFAULT_FORM_DATA

      // Pre-select project if only one is available
      if (safeProjects.length === 1) {
          initialData.project_id = safeProjects[0].id;
      }

      // If an 'update' object is provided (for editing), merge its values
      if (update) {
          Object.assign(initialData, update, {
              progress_photos: Array.isArray(update.progress_photos) ? update.progress_photos : [],
              materials_used: Array.isArray(update.materials_used) ? update.materials_used : [],
              // Ensure ai_issues_analysis is initialized from update or null
              ai_issues_analysis: update.ai_issues_analysis || null 
          });
      }
      
      setFormData(initialData);
      setMaterials(initialData.materials_used || []);
      // Also reset AI analysis related states if an update is loaded, or if starting a new form
      setAiAnalysis(initialData.ai_issues_analysis ? { // Use ai_issues_analysis if available
          internalSummary: initialData.ai_issues_analysis.internal_summary,
          actionPlan: initialData.ai_issues_analysis.action_plan,
          riskScore: initialData.ai_issues_analysis.risk_score,
          clientMessage: initialData.ai_issues_analysis.client_message
      } : null);
      setShowAISection(!!initialData.ai_summary || !!initialData.ai_issues_analysis); // Show AI section if there's pre-existing summary or analysis
  }, [update, safeProjects]);

  // Effect to populate roofingMaterials (placeholder for actual data fetching)
  useEffect(() => {
    // In a real application, you would fetch this from an API
    // For this example, we'll use a static list
    const fetchedRoofingMaterials = [
        { id: 'oc_duration', name: 'OC Duration Shingle', unit: 'bundle' },
        { id: 'oc_decoridge', name: 'OC DecoRidge Hip and Ridge Shingles', unit: 'bundle' },
        { id: 'titanium_udl30', name: 'Titanium UDL 30', unit: 'roll' },
        { id: 'oc_starter', name: 'OC Starter Strip', unit: 'bundle' },
        { id: 'valley_flashing', name: 'Valley Flashing', unit: 'linear_ft' },
        { id: 'step_flashing', name: 'Step Flashing', unit: 'piece' },
        { id: 'vents', name: 'Vents', unit: 'each' },
        { id: 'vent_pipe_flashing', name: 'Vent Pipe Flashing', unit: 'each' },
        { id: 'coil_nail_1_25', name: '1 1/4" coil nail', unit: 'box' },
        { id: 'coil_nail_2_4', name: '2/4-7/8-1" coil nail', unit: 'box' },
        { id: 'drip_edge', name: 'Drip Edge', unit: 'linear_ft' },
        { id: 'tpo_60mil', name: '60 Mil TPO Membrane', unit: 'sq_ft' },
        { id: 'fanfold_insulation', name: 'Fanfold Insulation', unit: 'sheet' },
        { id: 'fire_sheet', name: 'Fire Sheet', unit: 'sheet' },
        { id: 'clad_metal', name: 'Clad Metal', unit: 'sheet' },
        { id: 'counter_flashing', name: 'Counter Flashing', unit: 'linear_ft' },
        { id: 'plates_screws', name: 'Plates/Screws', unit: 'box' },
    ];
    setRoofingMaterials(fetchedRoofingMaterials);
  }, []);


  // Effect to keep formData.materials_used in sync with the separate materials state
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      materials_used: materials || []
    }));
  }, [materials]);

  // Effect to pre-populate sendToEmail from project data
  useEffect(() => {
    const project = safeProjects.find(p => p.id === formData.project_id);
    if (project && project.client_email) {
      setSendToEmail(project.client_email);
    } else {
      setSendToEmail("");
    }
  }, [formData.project_id, safeProjects]);

  const calculateTotalCost = () => {
    return (materials || []).reduce((sum, item) => sum + (item.extended_cost || 0), 0);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSubmit = { 
      ...formData,
      materials_used: materials || [],
      // Coerce empty strings to null for number fields
      hours_worked: formData.hours_worked ? parseFloat(formData.hours_worked) : null,
      completion_percentage: formData.completion_percentage ? parseFloat(formData.completion_percentage) : null,
    };
    
    onSubmit(dataToSubmit);
  };

  const generateAISummary = async () => {
    setIsGeneratingAI(true);
    setShowAISection(true);
    
    try {
      const project = safeProjects.find(p => p.id === formData.project_id);
      if (!project) {
        toast({ title: "Project Not Selected", description: "Please select a project before generating AI analysis.", variant: "destructive" });
        setIsGeneratingAI(false);
        setShowAISection(false);
        return;
      }

      const totalMaterialCost = calculateTotalCost();
      const currentMaterials = materials || [];
      const currentPhotos = formData.progress_photos || [];
      
      const prompt = `Generate a comprehensive analysis for this roofing daily update:

PROJECT CONTEXT:
- Project: ${project?.project_name || 'Unknown'}
- Address: ${project?.project_address || 'Unknown'}
- Date: ${formData.update_date}
- Weather: ${formData.weather_conditions?.replace('_', ' ')}

WORK PERFORMED:
- Manager's Notes: ${formData.pm_description}
- Crew Hours: ${formData.hours_worked} hours
- Project Completion: ${formData.completion_percentage}%
- Photos: ${currentPhotos.length} photos uploaded

MATERIALS USED (Total Cost: $${totalMaterialCost.toFixed(2)}):
${currentMaterials.length > 0 ? currentMaterials.map(m => `- ${m.quantity} ${m.unit} of ${m.material_name_display || m.material_name_text}: $${(m.extended_cost || 0).toFixed(2)}`).join('\n') : 'No materials logged'}

ISSUES/CHALLENGES:
${formData.issues_encountered || 'None reported'}

STRICTLY provide your response in the following format, with each item on a new line:
1. INTERNAL_SUMMARY: 3-4 bullet points for project managers. Be concise.
2. ACTION_PLAN: 1-2 actionable next steps for the crew or PM.
3. RISK_SCORE: A number from 0.0 (no risk) to 1.0 (high risk) assessing project risk based on issues.
4. CLIENT_MESSAGE: A friendly, professional summary for the client. Start with a greeting. Summarize the work performed. If there were any issues or delays reported in the 'ISSUES/CHALLENGES' section, please summarize them for the client in a clear, professional, and empathetic way, explaining how they are being handled or their impact, without dwelling on negatives. If no issues were reported, simply omit any mention of issues or delays. Do NOT mention internal costs.`;

      const response = await InvokeLLM({ prompt });

      // Robust parsing using regular expressions
      const parseSection = (text, sectionName) => {
        // Regex to capture content between a section header and the next section header or end of string
        // It looks for a line starting with `N. SECTION_NAME:` and captures everything until the next `N. ANOTHER_SECTION:` or end of string.
        const regex = new RegExp(`(?:\\d+\\.\\s*)?${sectionName}:\\s*([\\s\\S]*?)(?=\\n(?:\\d+\\.\\s*)?[A-Z_]+:|$)`, 'i');
        const match = text.match(regex);
        return match && match[1] ? match[1].trim() : null;
      };

      const internalSummary = parseSection(response, 'INTERNAL_SUMMARY');
      const actionPlan = parseSection(response, 'ACTION_PLAN');
      const riskScore = parseSection(response, 'RISK_SCORE');
      const clientMessage = parseSection(response, 'CLIENT_MESSAGE');

      if (!clientMessage && !internalSummary) {
        toast({
          title: "AI Analysis Failed",
          description: "The AI response could not be parsed. Please try generating again.",
          variant: "destructive",
        });
        setIsGeneratingAI(false);
        return;
      }
      
      const parsedAnalysis = {
        internalSummary: internalSummary || "Not generated.",
        actionPlan: actionPlan || "Not generated.",
        riskScore: riskScore || "Not generated.",
        clientMessage: clientMessage || "Could not generate client message. Please review internal summary."
      };

      setAiAnalysis(parsedAnalysis);
      
      setFormData(prev => ({
        ...prev,
        ai_summary: parsedAnalysis.clientMessage, // For backward compatibility and immediate display
        ai_issues_analysis: {
          internal_summary: parsedAnalysis.internalSummary,
          action_plan: parsedAnalysis.actionPlan,
          risk_score: parseFloat(parsedAnalysis.riskScore) || 0, // Ensure risk_score is a number
          client_message: parsedAnalysis.clientMessage
        }
      }));

    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast({
        title: "AI Generation Error",
        description: "An error occurred while communicating with the AI. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsGeneratingAI(false);
  };
  
  const handleSend = async () => {
    if (!formData.ai_summary) {
      toast({
        title: "No Summary to Send",
        description: "Please generate an AI summary before sending to the client.",
        variant: "destructive"
      });
      return;
    }

    if (!sendToEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendToEmail)) { // Added email validation
      toast({
        title: "Invalid Recipient Email",
        description: "Please enter a valid email address to send the update to.",
        variant: "destructive"
      });
      return;
    }

    const project = safeProjects.find(p => p.id === formData.project_id);

    try {
      const emailSubject = `Daily Update - ${project?.project_name || 'Project'} (${formData.update_date})`;
      
      const formattedSummary = formData.ai_summary
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p style="margin: 0 0 1em 0;">${line}</p>`)
        .join('');
      
      let emailBody = `<div style="font-family: sans-serif; line-height: 1.6;">${formattedSummary}`;
      
      const stats = [];
      if (formData.hours_worked) stats.push(`${formData.hours_worked} hours worked`);
      if (formData.completion_percentage) stats.push(`${formData.completion_percentage}% complete`);

      const photoCount = formData.progress_photos?.length || 0;
      if (photoCount > 0) {
        stats.push(`${photoCount} progress photo${photoCount > 1 ? 's' : ''}`);
      }
      
      if (stats.length > 0) {
        emailBody += `
          <h3 style="margin-top: 20px; font-size: 16px;">📊 Today's Progress:</h3>
          <ul style="padding-left: 20px; margin: 0;">
            ${stats.map(stat => `<li>${stat}</li>`).join('')}
          </ul>
        `;
      }
      
      if (photoCount > 0) {
          emailBody += `
              <h3 style="margin-top: 20px; font-size: 16px;">📷 Progress Photos:</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                  ${formData.progress_photos.map(photoUrl => `
                      <img src="${photoUrl}" alt="Progress Photo" style="max-width: 100%; width: 400px; height: auto; margin-bottom: 0px; border-radius: 8px; border: 1px solid #eee; display: block;" />
                  `).join('')}
              </div>
          `;
      }

      emailBody += `
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="margin: 0;">Best regards,<br/>${project?.project_manager || "Your Roofing Team"}</p>
        <p style="font-size: 12px; color: #777; margin-top: 15px;">This update was generated by your roofing team's project management system.</p>
      </div>`;

      await SendEmail({
        to: sendToEmail,
        subject: emailSubject,
        body: emailBody,
        from_name: project?.project_manager || "Your Roofing Team"
      });

      // Update the form data to mark as sent
      setFormData(prev => ({
        ...prev,
        sent_to_customer: true
      }));

      // Close send dialog
      setShowSendDialog(false);

      toast({
        title: "Update Sent Successfully",
        description: `Daily update has been sent to ${sendToEmail}`,
        variant: "default"
      });

    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Send Failed",
        description: "Could not send the update to the client. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Placeholder for copy logic
  const handleCopy = (text) => { 
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Content copied to clipboard.", variant: "success" });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-4xl mx-auto my-8 shadow-lg border-0 bg-white"> {/* Updated Card className */}
          {/* Form Header */}
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between"> {/* Adjusted CardHeader padding */}
            <h2 className="text-2xl font-bold text-gray-800">
              {update ? 'Edit Daily Update' : 'New Daily Update'}
            </h2>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" /> Save Update
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-8"> {/* Adjusted CardContent padding */}
            {/* Project and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Select name="project_id" value={formData.project_id} onValueChange={(value) => handleInputChange('project_id', value)} required>
                  <SelectTrigger id="project_id"><SelectValue placeholder="Select a project..." /></SelectTrigger>
                  <SelectContent>
                    {safeProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="update_date">Update Date</Label>
                <Input id="update_date" type="date" value={formData.update_date} onChange={(e) => handleInputChange('update_date', e.target.value)} required />
              </div>
            </div>
            
            {/* Main Description */}
            <Card>
              <CardHeader><CardTitle>Work Summary</CardTitle></CardHeader>
              <CardContent>
                <Label htmlFor="pm_description" className="sr-only">Work Summary</Label>
                <Textarea id="pm_description" placeholder="Describe work completed, crew activity, and any important notes for the internal team..." value={formData.pm_description} onChange={(e) => handleInputChange('pm_description', e.target.value)} rows={5} required />
              </CardContent>
            </Card>
            
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="weather_conditions">Weather</Label>
                <Select name="weather_conditions" value={formData.weather_conditions} onValueChange={(value) => handleInputChange('weather_conditions', value)}>
                  <SelectTrigger id="weather_conditions"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WEATHER_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hours_worked">Crew Hours Worked</Label>
                <Input id="hours_worked" type="number" placeholder="e.g., 24" value={formData.hours_worked} onChange={(e) => handleInputChange('hours_worked', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="completion_percentage">Est. Project Completion</Label>
                <Input id="completion_percentage" type="number" placeholder="e.g., 75" min="0" max="100" value={formData.completion_percentage} onChange={(e) => handleInputChange('completion_percentage', e.target.value)} />
              </div>
            </div>
            
            {/* Photos and Materials */}
            <Card>
              <CardHeader><CardTitle>Photos & Materials</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Progress Photos</Label>
                  <PhotoUploader photos={formData.progress_photos || []} onChange={(newPhotos) => handleInputChange('progress_photos', newPhotos)} />
                </div>
                <Separator />
                <div>
                  <Label>Materials Used (Cost Breakdown)</Label>
                  <MaterialsUsedForm 
                    materials={materials || []} 
                    onChange={setMaterials} 
                    roofingMaterials={roofingMaterials}
                  />
                  <p className="text-xs text-gray-500 mt-2">Finance-facing only; excluded from client messages unless explicitly shared.</p>
                </div>
              </CardContent>
            </Card>

            {/* Issues Encountered */}
            <Card>
              <CardHeader><CardTitle>Issues or Delays</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Describe any issues, challenges, or delays encountered..." value={formData.issues_encountered} onChange={(e) => handleInputChange('issues_encountered', e.target.value)} rows={3} />
              </CardContent>
            </Card>
            
            {/* AI Generation Section */}
            <div className="text-center">
              <Button type="button" onClick={generateAISummary} disabled={isGeneratingAI}>
                {isGeneratingAI ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {isGeneratingAI ? 'Generating Analysis...' : 'Generate AI Analysis & Summary'}
              </Button>
            </div>

            {/* AI Section Display */}
            {aiAnalysis && ( // Directly checking aiAnalysis to show section
              <Card className="mt-4 bg-gray-50/50"> {/* Updated Card className */}
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" /> AI Insights
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => { setAiAnalysis(null); setShowAISection(false); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-md mb-1">Internal Summary:</h4>
                    <div className="text-sm p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {aiAnalysis.internalSummary}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md mb-1">Action Plan:</h4>
                    <div className="text-sm p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {aiAnalysis.actionPlan}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md mb-1">Risk Score:</h4>
                    <div className="text-sm p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {aiAnalysis.riskScore}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-md mb-1 flex items-center justify-between">
                      <span>Client Message:</span>
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(formData.ai_summary)}>
                        <Copy className="w-4 h-4 mr-1" /> Copy
                      </Button>
                    </h4>
                    <Textarea
                      value={formData.ai_summary}
                      onChange={(e) => handleInputChange('ai_summary', e.target.value)}
                      rows={4}
                      className="mt-1"
                      placeholder="AI-generated client message..."
                    />
                    <Button type="button" className="mt-2" onClick={() => {
                      const project = safeProjects.find(p => p.id === formData.project_id);
                      setSendToEmail(project?.client_email || ""); // Pre-fill email from project
                      setShowSendDialog(true);
                    }}>
                      <Send className="w-4 h-4 mr-2" /> Send to Client
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>

          <CardFooter className="border-t border-gray-100 px-6 py-4 bg-gray-50"> {/* Added CardFooter */}
            <div className="flex justify-between items-center w-full">
              {formData.sent_to_customer && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" /> Sent to Customer
                </Badge>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" /> Save Update
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </form>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm and Send Update</DialogTitle>
            <DialogDescription>
              Review the recipient's email and the message before sending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="send-email">Recipient Email</Label>
              <Input
                id="send-email"
                type="email" // Changed type to email for better validation
                value={sendToEmail}
                onChange={(e) => setSendToEmail(e.target.value)}
                placeholder="client@example.com"
                required
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-md border text-sm max-h-60 overflow-y-auto">
              <p className="font-semibold mb-2">Message Preview:</p>
              <p className="text-gray-600 whitespace-pre-wrap">{formData.ai_summary}</p>
              {formData.progress_photos && formData.progress_photos.length > 0 && (
                <p className="text-gray-500 italic mt-2">
                  (+ {formData.progress_photos.length} photo{formData.progress_photos.length > 1 ? 's' : ''} will be included)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={isGeneratingAI || !sendToEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendToEmail)}> {/* Disable if email is invalid */}
              <Send className="w-4 h-4 mr-2" />
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
