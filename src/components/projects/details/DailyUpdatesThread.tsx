import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Eye,
  EyeOff,
  Mail, 
  Calendar,
  Plus,
  Loader2,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UpdateDetailsModal from '@/components/dailyupdates/UpdateDetailsModal';
import { DailyUpdate, User } from '@/api/supabaseEntities';

interface Update {
  id: string;
  update_date: string;
  created_date: string;
  headline?: string;
  ai_summary?: string;
  pm_description?: string;
  work_description?: string;
  visibility?: string;
  sent_to_customer?: boolean;
  created_by?: string;
  [key: string]: any;
}

export default function DailyUpdatesThread({ currentUser, projectId }: { currentUser: any, projectId?: string }) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [project, setProject] = useState<any>(null);
  const [authorCache, setAuthorCache] = useState<{ [key: string]: string }>({});

  // Fetch updates from database on component mount
  useEffect(() => {
    if (projectId) {
      fetchUpdates();
    }
  }, [projectId]);

  const fetchUpdates = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUpdates = await DailyUpdate.filter(
        { project_id: projectId },
        '-update_date'
      );
      console.log('Fetched updates from database:', fetchedUpdates); // Debug log
      setUpdates(fetchedUpdates);
    } catch (err) {
      console.error('Error fetching updates:', err);
      setError('Failed to load updates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAuthorName = async (userId: string) => {
    // Check cache first
    if (authorCache[userId]) {
      return authorCache[userId];
    }

    try {
      const user = await User.get(userId);
      const name = user?.full_name || user?.name || 'Unknown User';
      setAuthorCache(prev => ({ ...prev, [userId]: name }));
      return name;
    } catch (err) {
      console.error('Error fetching author:', err);
      return 'Unknown User';
    }
  };

  const groupUpdatesByDate = (updates: Update[]) => {
    const grouped: { [key: string]: Update[] } = {};
    updates.forEach((update: Update) => {
      const dateKey = format(parseISO(update.update_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(update);
    });
    return grouped;
  };

  const getUpdatePreview = (update: Update) => {
    console.log('Update object keys:', Object.keys(update)); // Debug: show what fields exist
    console.log('Update data:', update); // Debug log
    if (update.headline) return update.headline;
    if (update.ai_summary) return update.ai_summary.substring(0, 100) + '...';
    if (update.work_description) return update.work_description.substring(0, 100) + '...';
    if (update.pm_description) return update.pm_description.substring(0, 100) + '...';
    return 'No details provided';
  };

  // Update item component that handles async author fetching
  const UpdateItem = ({ update, onSelect }: { update: Update, onSelect: (update: Update) => void }) => {
    const [authorName, setAuthorName] = useState<string>('User');

    useEffect(() => {
      if (update.created_by) {
        getAuthorName(update.created_by).then(name => setAuthorName(name));
      }
    }, [update.created_by]);

    return (
      <div 
        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => onSelect(update)}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {authorName?.[0] || 'U'}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {authorName}
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
              
              {/* Preview */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 line-clamp-2">
                    {getUpdatePreview(update)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const groupedUpdates = groupUpdatesByDate(updates);
  const sortedDateKeys = Object.keys(groupedUpdates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <>
      <div className="space-y-6">
        {/* Updates Thread */}
        <Card className="min-h-[600px] relative">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Daily Updates Thread
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Click on any update to view full details
                </p>
              </div>
              <Link to={createPageUrl("DailyUpdates") + (projectId ? `?project=${projectId}` : '')}>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Update
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-500">Loading updates...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>{error}</p>
                </div>
              ) : sortedDateKeys.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No updates yet. Check back soon.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {sortedDateKeys.map(dateKey => (
                    <div key={dateKey}>
                      {/* Date Header */}
                      <div className="sticky top-0 bg-gray-50 px-6 py-2 border-b border-gray-200 z-10">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                        </div>
                      </div>
                      
                      {/* Updates for this date */}
                      {groupedUpdates[dateKey].map((update: Update, index: number) => (
                        <UpdateItem 
                          key={update.id}
                          update={update}
                          onSelect={setSelectedUpdate}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Update Details Modal */}
      {selectedUpdate && (
        <UpdateDetailsModal 
          update={selectedUpdate}
          project={project || { project_name: 'Project' }}
          onClose={() => setSelectedUpdate(null)}
          onEdit={() => {}} // Can implement edit later
          onUpdate={fetchUpdates}
        />
      )}
    </>
  );
}
