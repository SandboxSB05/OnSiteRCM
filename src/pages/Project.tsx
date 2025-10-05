import React, { useState, useEffect } from 'react';
import { Project } from '@/api/entities';
import { DailyUpdate } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

import ProjectHeader from '@/components/projects/details/ProjectHeader';
import ProjectTabs from '@/components/projects/details/ProjectTabs';
import InteractiveTimeline from '@/components/projects/details/InteractiveTimeline';
import DailyUpdatesThread from '@/components/projects/details/DailyUpdatesThread';

export default function ProjectPage() {
  const [project, setProject] = useState(null);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  
  const projectId = new URLSearchParams(window.location.search).get('id');

  const loadData = async () => {
    if (!projectId) {
      setError("No project ID provided.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [projectData, updatesData, currentUser] = await Promise.all([
        Project.get(projectId),
        DailyUpdate.filter({ project_id: projectId }, "-update_date"),
        User.me()
      ]);
      
      setProject(projectData);
      setDailyUpdates(updatesData);
      setUser(currentUser);

    } catch (e) {
      console.error("Failed to load project details:", e);
      setError("Failed to load project. It may not exist or you don't have permission to view it.");
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const handleProjectUpdate = (updatedProject) => {
    setProject(p => ({ ...p, ...updatedProject }));
  };

  const onUpdateCreated = (newUpdate) => {
    setDailyUpdates(prev => [newUpdate, ...prev].sort((a, b) => new Date(b.update_date) - new Date(a.update_date)));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <Link to={createPageUrl("Projects")} className="mt-4 inline-block text-blue-600 hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      <Link to={createPageUrl(user?.role === 'admin' ? "Projects" : "MyProjects")} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>
      
      <ProjectHeader project={project} />
      <ProjectTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'timeline' && (
          <InteractiveTimeline project={project} onProjectUpdate={handleProjectUpdate} />
        )}
        {activeTab === 'updates' && (
          <DailyUpdatesThread 
            project={project} 
            initialUpdates={dailyUpdates} 
            currentUser={user}
            onUpdateCreated={onUpdateCreated}
          />
        )}
         {activeTab === 'finances' && <div className="text-center py-12 text-gray-500">Finance tracking coming soon...</div>}
         {activeTab === 'files' && <div className="text-center py-12 text-gray-500">File management coming soon...</div>}
      </div>
    </div>
  );
}