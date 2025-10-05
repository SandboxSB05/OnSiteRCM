import React, { useState } from 'react';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Wand2, Lightbulb, Clipboard } from 'lucide-react';

export default function AiIssuesSynthesizer({ issuesText, onAnalysisGenerated, existingAnalysis }) {
    const [analysis, setAnalysis] = useState(existingAnalysis || null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const prompt = `Analyze the following roofing project issue and provide a structured JSON response.
            Issue Description: "${issuesText}"
            
            Output a JSON object with the following keys:
            - "internal_summary": A bulleted, concise summary for the project manager.
            - "action_plan": An array of objects, each with "step", "owner", and "eta" (e.g., "YYYY-MM-DD"). Suggest 3-5 clear steps.
            - "risk_score": A number from 0 to 100 representing the project risk level.
            - "risk_reason": A single sentence explaining the risk score.
            - "client_message": A reassuring, professional, 2-4 sentence message for the client.
            `;
            
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

            setAnalysis(result);
            onAnalysisGenerated(result);
        } catch (error) {
            console.error("Error generating AI analysis:", error);
        }
        setIsLoading(false);
    };

    const getRiskBadgeColor = (score) => {
        if (score > 70) return 'bg-red-100 text-red-800';
        if (score > 40) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-purple-100">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                    <Sparkles className="w-5 h-5" />
                    AI Issue Synthesizer
                </CardTitle>
                <Button onClick={handleAnalyze} disabled={isLoading} size="sm">
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    {analysis ? 'Regenerate' : 'Analyze Issues'}
                </Button>
            </CardHeader>
            {analysis && (
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-1">Internal Summary</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{analysis.internal_summary}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Action Plan</h4>
                                <ul className="space-y-1">
                                    {(analysis.action_plan || []).map((item, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                                            <span>- {item.step}</span>
                                            <span className="font-medium">({item.owner}, by {item.eta})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <h4 className="font-semibold text-gray-800 mb-1">Risk Assessment</h4>
                                <Badge className={getRiskBadgeColor(analysis.risk_score)}>
                                    Risk Score: {analysis.risk_score} / 100
                                </Badge>
                                <p className="text-xs text-gray-600 mt-1">{analysis.risk_reason}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Client Message</h4>
                                <p className="text-sm p-3 bg-white rounded-md border text-gray-700">{analysis.client_message}</p>
                                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(analysis.client_message)} className="mt-1">
                                    <Clipboard className="w-3 h-3 mr-1" /> Copy
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}