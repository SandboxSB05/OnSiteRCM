import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  RefreshCw, 
  ArrowDown, 
  CheckCircle,
  AlertTriangle,
  Target,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { InvokeLLM } from "@/api/integrations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ComprehensiveAiSynthesizer({ 
  updateData, 
  onAnalysisGenerated,
  existingAnalysis 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(existingAnalysis || {
    internal_summary: '',
    action_plan: '',
    risk_score: 0,
    risk_reason: '',
    client_message: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyStates, setCopyStates] = useState({});

  useEffect(() => {
    if (existingAnalysis) {
      setAnalysis(existingAnalysis);
    }
  }, [existingAnalysis]);

  const generateAnalysis = async () => {
    if (!updateData.pm_description?.trim()) {
      alert("Please add manager's notes before generating AI summary.");
      return;
    }

    setIsGenerating(true);
    try {
      const materialsText = (updateData.materials_used || [])
        .map(m => `${m.quantity} ${m.unit} of ${m.material_name_display || 'material'} at $${m.unit_cost}/unit ($${m.extended_cost} total)`)
        .join(', ');
      
      const materialsSubtotal = (updateData.materials_used || [])
        .reduce((sum, item) => sum + (item.extended_cost || 0), 0);

      const prompt = `You are an expert roofing project manager AI. Analyze this daily update and generate a comprehensive summary.

PROJECT CONTEXT:
- Weather: ${updateData.weather_conditions || 'Not specified'}
- Crew Hours: ${updateData.hours_worked || 'Not specified'}
- Completion: ${updateData.completion_percentage || 'Not specified'}%

MANAGER'S NOTES:
${updateData.pm_description}

MATERIALS USED:
${materialsText || 'No materials logged'}
Materials Subtotal: $${materialsSubtotal.toFixed(2)}

PHOTOS: ${(updateData.progress_photos || []).length} progress photos attached

ISSUES/DELAYS:
${updateData.issues_encountered || 'None reported'}

Generate a JSON response with:
1. internal_summary: 3-4 bullet points for internal team (include any issues, progress, next steps)
2. action_plan: Array of 3-5 specific action steps with owner and estimated completion
3. risk_score: Number 0-100 (0=no risk, 100=critical)
4. risk_reason: One sentence explaining the risk score
5. client_message: 2-3 friendly sentences for the customer (no internal costs unless critical)

Make it professional but approachable. Focus on progress and solutions.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            internal_summary: { type: "string" },
            action_plan: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  owner: { type: "string" },
                  eta: { type: "string" }
                }
              }
            },
            risk_score: { type: "number" },
            risk_reason: { type: "string" },
            client_message: { type: "string" }
          }
        }
      });
      
      const newAnalysis = {
        internal_summary: result.internal_summary || '',
        action_plan: Array.isArray(result.action_plan) ? 
          result.action_plan.map(step => typeof step === 'string' ? step : `${step.step} (${step.owner}, ${step.eta})`).join('\n') :
          (result.action_plan || ''),
        risk_score: result.risk_score || 0,
        risk_reason: result.risk_reason || '',
        client_message: result.client_message || ''
      };
      
      setAnalysis(newAnalysis);
      onAnalysisGenerated(newAnalysis);
      setIsExpanded(true);
    } catch (error) {
      console.error("Error generating analysis:", error);
      alert("Failed to generate AI analysis. Please try again.");
    }
    setIsGenerating(false);
  };

  const handleCopy = async (content, key) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const insertClientMessage = () => {
    if (analysis.client_message && window.updateFormHandler) {
      window.updateFormHandler.insertIntoSummary(analysis.client_message);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Synthesizer
          </h3>
          <p className="text-sm text-gray-500 mt-1">Generate comprehensive summary from all inputs</p>
        </div>
        
        <div className="flex items-center gap-2">
          {analysis.internal_summary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateAnalysis()}
              disabled={isGenerating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          )}
          
          <Button
            type="button"
            onClick={generateAnalysis}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {analysis.internal_summary ? 'Regenerate' : 'Generate'} Analysis
          </Button>
        </div>
      </div>

      {analysis.internal_summary && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>AI Analysis Generated</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <Tabs defaultValue="internal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="internal" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Internal
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Actions
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk
                </TabsTrigger>
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Client
                </TabsTrigger>
              </TabsList>

              <TabsContent value="internal" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Internal Summary</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(analysis.internal_summary, 'internal')}
                  >
                    {copyStates.internal ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={analysis.internal_summary}
                  onChange={(e) => setAnalysis(prev => ({ ...prev, internal_summary: e.target.value }))}
                  rows={4}
                  className="bg-gray-50"
                />
              </TabsContent>

              <TabsContent value="actions" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Action Plan</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(analysis.action_plan, 'actions')}
                  >
                    {copyStates.actions ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={analysis.action_plan}
                  onChange={(e) => setAnalysis(prev => ({ ...prev, action_plan: e.target.value }))}
                  rows={5}
                  className="bg-gray-50"
                  placeholder="Next steps with owners and timelines..."
                />
              </TabsContent>

              <TabsContent value="risk" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Risk Assessment</h4>
                  <Badge className={`${getRiskColor(analysis.risk_score)} text-white`}>
                    {analysis.risk_score}/100 - {getRiskLabel(analysis.risk_score)}
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getRiskColor(analysis.risk_score)}`}
                        style={{ width: `${analysis.risk_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{analysis.risk_score}%</span>
                  </div>
                  <p className="text-sm text-gray-700">{analysis.risk_reason}</p>
                </div>
              </TabsContent>

              <TabsContent value="client" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Client-Ready Message</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(analysis.client_message, 'client')}
                    >
                      {copyStates.client ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={insertClientMessage}
                    >
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Insert
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={analysis.client_message}
                  onChange={(e) => setAnalysis(prev => ({ ...prev, client_message: e.target.value }))}
                  rows={3}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  This message is customer-friendly and excludes internal cost details.
                </p>
              </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}