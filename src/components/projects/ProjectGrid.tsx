
import React, { useState, useEffect, useCallback } from 'react';
import { DailyUpdate } from '@/api/supabaseEntities';
import { User } from '@/api/supabaseEntities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User as UserIcon, Calendar, Edit, DollarSign, Users, Square, ArrowRight, MessageSquare, Clock, Eye, EyeOff } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusColors = {
  planning: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  on_hold: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  planning: "Planning",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold"
};

const typeLabels = {
  residential_replacement: "Residential Replacement",
  residential_repair: "Residential Repair", 
  commercial_replacement: "Commercial Replacement",
  commercial_repair: "Commercial Repair",
  new_construction: "New Construction"
};

const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

export default function ProjectGrid({ projects, isLoading, onEdit, viewOnly = false }) {
  const [projectUpdates, setProjectUpdates] = useState({});
  const [updatesLoading, setUpdatesLoading] = useState(true);

  const loadUpdateCounts = useCallback(async () => {
    if (!projects || projects.length === 0) {
        setUpdatesLoading(false);
        setProjectUpdates({}); // Clear previous updates if projects become empty
        return;
    }
    setUpdatesLoading(true);
    try {
      const safeProjects = Array.isArray(projects) ? projects : [];
      const updatePromises = safeProjects.map(async (project) => {
        const updatesData = await DailyUpdate.filter({ project_id: project.id });
        const updates = Array.isArray(updatesData) ? updatesData : [];
        
        const clientVisible = updates.filter(u => u.ai_summary && u.ai_summary.trim() !== '').length;
        const internal = updates.length - clientVisible;
        const lastUpdate = updates.length > 0 ? updates.sort((a, b) => new Date(b.update_date) - new Date(a.update_date))[0] : null;
        
        let lastAuthor = null;
        if (lastUpdate && lastUpdate.created_by) {
          try {
            // Correctly filter by email instead of getting by ID
            const users = await User.filter({ email: lastUpdate.created_by });
            if (users && users.length > 0) {
              lastAuthor = users[0];
            }
          } catch (error) {
            console.log("Could not load last author by email:", error);
          }
        }

        return {
          projectId: project.id,
          total: updates.length,
          clientVisible,
          internal,
          lastUpdate,
          lastAuthor
        };
      });

      const results = await Promise.all(updatePromises);
      const updatesMap = {};
      results.forEach(result => {
        updatesMap[result.projectId] = result;
      });
      
      setProjectUpdates(updatesMap);
    } catch (error) {
      console.error("Error loading update counts:", error);
      setProjectUpdates({}); // Ensure state is reset on error as well
    }
    setUpdatesLoading(false);
  }, [projects]);

  useEffect(() => {
    if (projects && projects.length > 0) {
      loadUpdateCounts();
    } else {
        setProjectUpdates({});
        setUpdatesLoading(false);
    }
  }, [projects, loadUpdateCounts]);

  const getUpdateRecencyStyle = (lastUpdate) => {
    if (!lastUpdate || !isValidDate(lastUpdate.update_date)) return "";
    const daysSince = (Date.now() - new Date(lastUpdate.update_date)) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) return "text-orange-600 bg-orange-50";
    if (daysSince > 3) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  if (isLoading || updatesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="border border-[rgba(0,0,0,0.08)] rounded-2xl animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-emerald-100" />
              <Skeleton className="h-4 w-1/2 bg-emerald-50" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-emerald-50" />
                <Skeleton className="h-4 w-2/3 bg-emerald-50" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 bg-emerald-100" />
                  <Skeleton className="h-6 w-20 bg-emerald-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(0,0,0,0.12)] bg-gradient-to-br from-emerald-50/30 to-teal-50/30 py-16 text-center">
        <div className="text-[#030213] text-lg font-semibold mb-2">No projects found</div>
        <p className="text-[#717182]">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const updateData = projectUpdates[project.id] || { total: 0, clientVisible: 0, internal: 0, lastUpdate: null, lastAuthor: null };
        
        return (
          <Card key={project.id} className="border border-[rgba(0,0,0,0.08)] bg-white shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 rounded-2xl flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Link to={createPageUrl(`Project?id=${project.id}`)} className="group">
                    <h3 className="font-semibold text-lg text-[#030213] truncate mb-1 group-hover:text-emerald-600 transition-colors">
                      {project.project_name}
                    </h3>
                  </Link>
                  <p className="text-sm text-[#717182] mb-2">
                    {typeLabels[project.project_type]}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${statusColors[project.project_status]} border text-xs`}>
                      {statusLabels[project.project_status]}
                    </Badge>
                    
                    {/* Update Count Badge */}
                    {updateData.total > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 border-emerald-200 text-emerald-700">
                        <MessageSquare className="w-3 h-3" />
                        {updateData.total}
                      </Badge>
                    )}
                  </div>
                </div>
                {!viewOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(project)}
                    className="flex-shrink-0 ml-2 text-[#717182] hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {viewOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(project)}
                    className="flex-shrink-0 ml-2 text-[#717182] hover:text-emerald-600 hover:bg-emerald-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3 flex-1 flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#717182]">
                  <UserIcon className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span className="truncate">{project.client_name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-[#717182]">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span className="truncate">{project.address_line1 || project.project_address}, {project.city}</span>
                </div>
                
                {isValidDate(project.estimated_end_date) && (
                  <div className="flex items-center gap-2 text-sm text-[#717182]">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>Due {format(new Date(project.estimated_end_date), 'MMM d, yyyy')}</span>
                  </div>
                )}

                {/* Updates Summary */}
                {updateData.total > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 space-y-2 border border-emerald-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#030213]">Updates Activity</span>
                      {updateData.lastUpdate && isValidDate(updateData.lastUpdate.update_date) && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getUpdateRecencyStyle(updateData.lastUpdate)}`}>
                          {formatDistanceToNow(new Date(updateData.lastUpdate.update_date), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-xs">
                        {updateData.clientVisible > 0 && (
                          <div className="flex items-center gap-1 text-emerald-700">
                            <Eye className="w-3 h-3" />
                            <span>{updateData.clientVisible} Client</span>
                          </div>
                        )}
                        {updateData.internal > 0 && (
                          <div className="flex items-center gap-1 text-[#717182]">
                            <EyeOff className="w-3 h-3" />
                            <span>{updateData.internal} Internal</span>
                          </div>
                        )}
                      </div>
                      
                      {updateData.lastAuthor && (
                        <div className="flex items-center gap-1 text-xs text-[#717182]">
                          <span>by</span>
                          <span className="font-medium text-[#030213]">{updateData.lastAuthor.full_name || 'User'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Stats */}
              <div className="pt-3 border-t border-[rgba(0,0,0,0.06)]">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {project.project_budget && (
                    <div className="space-y-1">
                      <div className="flex justify-center">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-xs text-[#717182]">Budget</div>
                      <div className="text-sm font-semibold text-[#030213]">${(project.project_budget / 1000).toFixed(0)}k</div>
                    </div>
                  )}
                  
                  {project.crew_size && (
                    <div className="space-y-1">
                      <div className="flex justify-center">
                        <Users className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="text-xs text-[#717182]">Crew</div>
                      <div className="text-sm font-semibold text-[#030213]">{project.crew_size} people</div>
                    </div>
                  )}
                  
                  {project.square_footage && (
                    <div className="space-y-1">
                      <div className="flex justify-center">
                        <Square className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-xs text-[#717182]">Sq Ft</div>
                      <div className="text-sm font-semibold text-[#030213]">{project.square_footage.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            <div className="border-t border-[rgba(0,0,0,0.06)] p-2">
              {viewOnly ? (
                <Button 
                  variant="ghost" 
                  className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => onEdit(project)}
                >
                  View Details <ArrowRight className="w-4 h-4 ml-2"/>
                </Button>
              ) : (
                <Link to={createPageUrl(`Project?id=${project.id}`)} className="w-full">
                  <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    View Details <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
