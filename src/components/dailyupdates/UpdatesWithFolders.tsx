
import React, { useState, useEffect, useCallback } from "react";
import { DailyUpdate } from "@/api/supabaseEntities";
import { UpdateThread } from "@/api/supabaseEntities";
import { Project } from "@/api/supabaseEntities";
import { User } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, FolderOpen, MessageSquare, Plus, Trash2, Undo2, Send } from "lucide-react";
import { format, addDays, subDays, isToday, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SendEmail } from "@/api/integrations";

import UpdateForm from "./UpdateForm";
import DayUpdatesList from "./DayUpdatesList";

export default function UpdatesWithFolders({ projectId }) {
  const [project, setProject] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [undoTokens, setUndoTokens] = useState({});
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [updateToSend, setUpdateToSend] = useState(null);
  const [sendToEmail, setSendToEmail] = useState("");
  const { toast } = useToast();

  const loadProjectAndThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectData, threadsData] = await Promise.all([
        Project.get(projectId),
        UpdateThread.filter({ project_id: projectId })
      ]);
      
      setProject(projectData);
      
      const safeThreadsData = Array.isArray(threadsData) ? threadsData : [];
      // Ensure we have a daily thread, create if not exists
      let dailyThread = safeThreadsData.find(t => t.is_daily);
      if (!dailyThread) {
        dailyThread = await UpdateThread.create({
          project_id: projectId,
          title: "Daily Updates",
          is_daily: true,
          description: "Daily progress updates and communications"
        });
        if (dailyThread) {
            safeThreadsData.unshift(dailyThread);
        }
      }
      
      setThreads(safeThreadsData);
      setSelectedThread(dailyThread || null);
    } catch (error) {
      console.error("Error loading project and threads:", error);
      setThreads([]);
      setSelectedThread(null);
    }
    setIsLoading(false);
  }, [projectId]);

  const loadDayUpdates = useCallback(async () => {
    if (!selectedThread) return;
    
    try {
      const dayUpdates = await DailyUpdate.filter({ 
        project_id: projectId, 
        day_bucket: selectedDate 
      });
      
      const safeUpdates = Array.isArray(dayUpdates) ? dayUpdates : [];
      const activeUpdates = safeUpdates
        .filter(update => !update.deleted_at)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        
      setUpdates(activeUpdates);
    } catch (error) {
      console.error("Error loading day updates:", error);
      setUpdates([]);
    }
  }, [selectedThread, projectId, selectedDate]);

  useEffect(() => {
    if (projectId) {
      loadProjectAndThreads();
    }
  }, [projectId, loadProjectAndThreads]);

  useEffect(() => {
    if (selectedThread && selectedThread.is_daily) {
      loadDayUpdates();
    }
  }, [selectedThread, selectedDate, loadDayUpdates]);

  const handleSubmit = async (updateData) => {
    try {
      const safeUpdateData = {
        ...updateData,
        day_bucket: updateData.update_date,
        materials_used: Array.isArray(updateData.materials_used) ? updateData.materials_used : [],
        progress_photos: Array.isArray(updateData.progress_photos) ? updateData.progress_photos : []
      };
      
      if (editingUpdate) {
        await DailyUpdate.update(editingUpdate.id, safeUpdateData);
      } else {
        await DailyUpdate.create(safeUpdateData);
      }
      
      setShowForm(false);
      setEditingUpdate(null);
      loadDayUpdates();
    } catch (error) {
      console.error("Error saving update:", error);
    }
  };

  const handleDeleteUpdate = async (updateId) => {
    try {
      const currentUser = await User.me();
      const undoToken = `undo_${updateId}_${Date.now()}`;
      
      await DailyUpdate.update(updateId, {
        deleted_at: new Date().toISOString(),
        deleted_by: currentUser.email,
        undo_token: undoToken
      });
      
      setUndoTokens(prev => ({
        ...prev,
        [updateId]: {
          token: undoToken,
          expiresAt: Date.now() + (2 * 60 * 1000)
        }
      }));
      
      toast({
        title: "Update deleted",
        description: "The update has been deleted.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUndoDelete(updateId)}
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Undo
          </Button>
        ),
      });
      
      setUpdates(prev => (prev || []).filter(u => u.id !== updateId));
      
      setTimeout(() => {
        setUndoTokens(prev => {
          const { [updateId]: removed, ...rest } = prev;
          return rest;
        });
      }, 2 * 60 * 1000);
      
    } catch (error) {
      console.error("Error deleting update:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the update. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUndoDelete = async (updateId) => {
    try {
      const tokenData = undoTokens[updateId];
      if (!tokenData || Date.now() > tokenData.expiresAt) {
        toast({
          title: "Undo failed",
          description: "The undo window has expired.",
          variant: "destructive"
        });
        return;
      }
      
      await DailyUpdate.update(updateId, {
        deleted_at: null,
        deleted_by: null,
        undo_token: null
      });
      
      setUndoTokens(prev => {
        const { [updateId]: removed, ...rest } = prev;
        return rest;
      });
      
      toast({
        title: "Update restored",
        description: "The update has been restored.",
      });
      
      loadDayUpdates();
      
    } catch (error) {
      console.error("Error undoing delete:", error);
      toast({
        title: "Undo failed",
        description: "Could not restore the update. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInitiateSend = (update) => {
    setUpdateToSend(update);
    const clientEmail = project?.client_email || "";
    setSendToEmail(clientEmail);
    setShowSendDialog(true);
  };

  const handleSendEmail = async () => {
    if (!updateToSend || !sendToEmail || !project) {
      toast({ title: "Missing information", description: "Cannot send email. Please ensure an update is selected, recipient email is provided, and project data is loaded.", variant: "destructive" });
      return;
    }
  
    try {
      const emailSubject = `Daily Update - ${project.project_name} (${format(parseISO(updateToSend.update_date), 'MMM d, yyyy')})`;
      
      const rawSummary = updateToSend.ai_summary || updateToSend.pm_description || "";
      const formattedSummary = rawSummary
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p style="margin: 0 0 1em 0;">${line}</p>`)
        .join('');
      
      let emailBody = `<div style="font-family: sans-serif; line-height: 1.6;">${formattedSummary}`;
      
      const stats = [];
      if (updateToSend.hours_worked) stats.push(`${updateToSend.hours_worked} hours worked`);
      if (updateToSend.completion_percentage) stats.push(`${updateToSend.completion_percentage}% complete`);
      
      const photoCount = updateToSend.progress_photos?.length || 0;
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
              <div>
                  ${updateToSend.progress_photos.map(photoUrl => `
                      <img src="${photoUrl}" alt="Progress Photo" style="max-width: 100%; width: 400px; height: auto; margin-bottom: 15px; border-radius: 8px; border: 1px solid #eee;" />
                  `).join('')}
              </div>
          `;
      }

      emailBody += `
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="margin: 0;">Best regards,<br/>${project.project_manager || "Your Roofing Team"}</p>
        <p style="font-size: 12px; color: #777; margin-top: 15px;">This update was generated by your roofing team's project management system.</p>
      </div>`;
  
      await SendEmail({
        to: sendToEmail,
        subject: emailSubject,
        body: emailBody,
        from_name: project.project_manager || "Your Roofing Team"
      });
  
      await DailyUpdate.update(updateToSend.id, { sent_to_customer: true });
      
      setUpdates(prev => prev.map(u => u.id === updateToSend.id ? { ...u, sent_to_customer: true } : u));
  
      setShowSendDialog(false);
      setUpdateToSend(null);
  
      toast({
        title: "Update Sent Successfully",
        description: `Daily update has been sent to ${sendToEmail}`,
      });
  
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Send Failed",
        description: "Could not send the update. Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigateDay = (direction) => {
    const currentDate = parseISO(selectedDate);
    const newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const getDayLabel = (dateStr) => {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    return format(date, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading updates...</div>
      </div>
    );
  }

  const safeThreads = Array.isArray(threads) ? threads : [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Rail - Folders */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Update Folders</h2>
          <p className="text-sm text-gray-600">{project?.project_name}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {safeThreads.map(thread => (
            <Button
              key={thread.id}
              variant={selectedThread?.id === thread.id ? "default" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => setSelectedThread(thread)}
            >
              <div className="flex items-center gap-3 w-full">
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium truncate">{thread.title}</div>
                  {thread.is_daily && (
                    <div className="text-xs text-gray-500 mt-1">
                      Daily progress updates
                    </div>
                  )}
                </div>
                {thread.is_daily && (
                  <Badge variant="secondary" className="text-xs">
                    {(updates || []).length}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedThread?.is_daily ? (
          <>
            {/* Daily Updates Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Daily Updates</h1>
                  <p className="text-gray-600">Track daily progress and communicate with clients</p>
                </div>
                
                {!showForm && (
                  <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Update
                  </Button>
                )}
              </div>

              {/* Date Navigation */}
              {!showForm && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateDay('prev')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-40"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateDay('next')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="text-blue-600"
                    >
                      Today
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      Showing {getDayLabel(selectedDate)}
                    </div>
                  </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {showForm ? (
                <UpdateForm
                  update={editingUpdate}
                  projects={project ? [project] : []}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingUpdate(null);
                  }}
                />
              ) : (
                <DayUpdatesList
                  updates={updates || []}
                  selectedDate={selectedDate}
                  onEdit={(update) => {
                    setEditingUpdate(update);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteUpdate}
                  onSend={handleInitiateSend}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Folder</h3>
              <p className="text-gray-500">Choose a folder from the left to view updates</p>
            </div>
          </div>
        )}
      </div>

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
                type="email"
                value={sendToEmail}
                onChange={(e) => setSendToEmail(e.target.value)}
                placeholder="client@example.com"
                required
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-md border text-sm max-h-60 overflow-y-auto">
              <p className="font-semibold mb-2">Message Preview:</p>
              <p className="text-gray-600 whitespace-pre-wrap">{updateToSend?.ai_summary || updateToSend?.pm_description}</p>
              {updateToSend?.progress_photos && updateToSend.progress_photos.length > 0 && (
                <p className="text-gray-500 italic mt-2">
                  (+ {updateToSend.progress_photos.length} photo{updateToSend.progress_photos.length > 1 ? 's' : ''} will be attached)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={!sendToEmail || !updateToSend}>
              <Send className="w-4 h-4 mr-2" />
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
