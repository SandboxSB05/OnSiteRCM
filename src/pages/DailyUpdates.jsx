
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Project } from "@/api/entities";
import { User } from "@/api/entities";
import { ProjectCollaborator } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen } from "lucide-react";

import UpdatesWithFolders from "../components/dailyupdates/UpdatesWithFolders";

export default function DailyUpdates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    // Check for project ID in URL params
    const projectId = searchParams.get('project');
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProjectId(projectId);
      }
    } else if (projects.length === 1) {
      // Auto-select if only one project
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, searchParams]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      
      if (currentUser.role === 'admin') {
        // Admin: Load all projects
        const allProjects = await Project.list("-created_date");
        setProjects(Array.isArray(allProjects) ? allProjects : []);
      } else {
        // User: Load only their projects
        const ownedProjects = await Project.filter({ owner_user_id: currentUser.id });
        
        const collaborationsResponse = await ProjectCollaborator.filter({ user_id: currentUser.id });
        const collaborations = Array.isArray(collaborationsResponse) ? collaborationsResponse : [];
        const collaboratedProjectIds = collaborations.map(c => c.project_id);
        
        let collaboratedProjects = [];
        if (collaboratedProjectIds.length > 0) {
            const projectsPromises = collaboratedProjectIds.map(id => Project.get(id));
            const resolvedProjects = await Promise.all(projectsPromises);
            collaboratedProjects = resolvedProjects.filter(p => p); // Filter out any null/undefined results
        }
        
        const allUserProjects = [...(ownedProjects || []), ...collaboratedProjects];
        const userProjects = allUserProjects.filter((project, index, self) => 
            project && index === self.findIndex((p) => p.id === project.id)
        );
        setProjects(userProjects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]); // Set to empty array on error to prevent issues
    }
    setIsLoading(false);
  };

  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    setSearchParams({ project: projectId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
        <div className="text-center py-20">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
          <p className="text-gray-500">You need access to at least one project to create daily updates.</p>
        </div>
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
            <p className="text-gray-500 mb-6">Choose a project to manage its daily updates</p>
            
            <div className="max-w-sm mx-auto">
              <Select value="" onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Project Selector */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Updates</h1>
            <p className="text-gray-600">Manage daily progress updates by project</p>
          </div>
          
          {projects.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Project:</span>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <UpdatesWithFolders projectId={selectedProjectId} />
    </div>
  );
}
