import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Camera, 
  Mail, 
  Phone,
  Eye,
  EyeOff,
  Calendar,
  User,
  Clock
} from "lucide-react";
import { format, parseISO, isSameDay } from 'date-fns';
import { DailyUpdate } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { SendEmail } from '@/api/integrations';

export default function DailyUpdatesThread({ project, initialUpdates, currentUser, onUpdateCreated }) {
  const [updates, setUpdates] = useState(initialUpdates || []);
  const [newUpdate, setNewUpdate] = useState({
    headline: '',
    pm_description: '',
    ai_summary: '',
    visibility: 'internal'
  });
  const [clientEmails, setClientEmails] = useState([project.client_email].filter(Boolean));
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    setUpdates(initialUpdates || []);
  }, [initialUpdates]);

  const groupUpdatesByDate = (updates) => {
    const grouped = {};
    updates.forEach(update => {
      const dateKey = format(parseISO(update.update_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(update);
    });
    return grouped;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUpdate.pm_description.trim()) return;

    setIsPosting(true);
    try {
      const updateData = {
        project_id: project.id,
        author_user_id: currentUser.id,
        update_date: new Date().toISOString().split('T')[0],
        headline: newUpdate.headline || `Update for ${format(new Date(), 'MMMM d, yyyy')}`,
        pm_description: newUpdate.pm_description,
        ai_summary: newUpdate.ai_summary,
        visibility: newUpdate.visibility,
        progress_photos: [],
        materials_used: [],
        weather_conditions: 'sunny',
        hours_worked: 0,
        completion_percentage: 0,
        issues_encountered: '',
        sent_to_customer: false
      };

      const createdUpdate = await DailyUpdate.create(updateData);
      
      // Send email notification if client_visible and emails provided
      if (newUpdate.visibility === 'client_visible' && clientEmails.length > 0) {
        const emailBody = `
          <h2>Project Update: ${project.project_name}</h2>
          <p><strong>Date:</strong> ${format(new Date(), 'MMMM d, yyyy')}</p>
          ${newUpdate.headline ? `<p><strong>Update:</strong> ${newUpdate.headline}</p>` : ''}
          ${newUpdate.ai_summary ? `<p>${newUpdate.ai_summary}</p>` : `<p>${newUpdate.pm_description}</p>`}
          <br>
          <p>Best regards,<br>The OnSite RCM Team</p>
        `;

        for (const email of clientEmails) {
          try {
            await SendEmail({
              to: email,
              subject: `Project Update: ${project.project_name}`,
              body: emailBody
            });
          } catch (emailError) {
            console.error(`Failed to send email to ${email}:`, emailError);
          }
        }

        // Mark as sent to customer
        await DailyUpdate.update(createdUpdate.id, { sent_to_customer: true });
        createdUpdate.sent_to_customer = true;
      }

      setUpdates(prev => [createdUpdate, ...prev].sort((a, b) => new Date(b.update_date) - new Date(a.update_date)));
      setNewUpdate({ headline: '', pm_description: '', ai_summary: '', visibility: 'internal' });
      onUpdateCreated(createdUpdate);
    } catch (error) {
      console.error("Error posting update:", error);
    }
    setIsPosting(false);
  };

  const groupedUpdates = groupUpdatesByDate(updates);
  const sortedDateKeys = Object.keys(groupedUpdates).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-6">
      {/* Updates Thread */}
      <Card className="min-h-[600px]">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Daily Updates Thread
          </CardTitle>
          <p className="text-sm text-gray-600">
            All project updates in one continuous thread
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {sortedDateKeys.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No updates yet. Post the first update below!</p>
              </div>
            ) : (
              <div className="space-y-0">
                {sortedDateKeys.map(dateKey => (
                  <div key={dateKey}>
                    {/* Date Header */}
                    <div className="sticky top-0 bg-gray-50 px-6 py-2 border-b border-gray-200 z-10">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')}
                      </div>
                    </div>
                    
                    {/* Updates for this date */}
                    {groupedUpdates[dateKey].map((update, index) => (
                      <div key={update.id} className="border-b border-gray-100 last:border-b-0">
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {currentUser.full_name?.[0] || 'U'}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {currentUser.full_name || 'User'}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {format(parseISO(update.created_date), 'h:mm a')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {update.visibility === 'client_visible' ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Client Visible
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">
                                      <EyeOff className="w-3 h-3 mr-1" />
                                      Internal
                                    </Badge>
                                  )}
                                  {update.sent_to_customer && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      <Mail className="w-3 h-3 mr-1" />
                                      Sent
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Headline */}
                              {update.headline && (
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  {update.headline}
                                </h4>
                              )}
                              
                              {/* Content */}
                              <div className="space-y-2">
                                {update.ai_summary && update.visibility === 'client_visible' && (
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-900 font-medium mb-1">Client Summary:</p>
                                    <p className="text-blue-800">{update.ai_summary}</p>
                                  </div>
                                )}
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm text-gray-600 font-medium mb-1">Internal Notes:</p>
                                  <p className="text-gray-800 whitespace-pre-wrap">{update.pm_description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Update Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post New Update</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline (Optional)</Label>
              <Input
                id="headline"
                value={newUpdate.headline}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="Brief update title..."
              />
            </div>

            <div>
              <Label htmlFor="pm_description">Update Details *</Label>
              <Textarea
                id="pm_description"
                value={newUpdate.pm_description}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, pm_description: e.target.value }))}
                placeholder="What happened today? Any progress, issues, or notes..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="ai_summary">Client-Friendly Summary (Optional)</Label>
              <Textarea
                id="ai_summary"
                value={newUpdate.ai_summary}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, ai_summary: e.target.value }))}
                placeholder="A brief, positive summary for the client..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label>Visibility</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={newUpdate.visibility === 'internal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewUpdate(prev => ({ ...prev, visibility: 'internal' }))}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Internal Only
                  </Button>
                  <Button
                    type="button"
                    variant={newUpdate.visibility === 'client_visible' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewUpdate(prev => ({ ...prev, visibility: 'client_visible' }))}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Client Visible
                  </Button>
                </div>
              </div>
            </div>

            {newUpdate.visibility === 'client_visible' && (
              <div>
                <Label htmlFor="client_emails">Client Email(s)</Label>
                <Input
                  id="client_emails"
                  value={clientEmails.join(', ')}
                  onChange={(e) => setClientEmails(e.target.value.split(',').map(email => email.trim()).filter(Boolean))}
                  placeholder="client@example.com, client2@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple emails with commas. Updates will be sent to all addresses.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPosting || !newUpdate.pm_description.trim()}>
                {isPosting ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {newUpdate.visibility === 'client_visible' ? 'Post & Send to Client' : 'Post Update'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}