
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Project } from "@/api/supabaseEntities";
import { User } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import ProjectForm from "../components/projects/ProjectForm";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectGrid from "../components/projects/ProjectGrid";
import ClientProjectView from "../components/projects/ClientProjectView";

interface ProjectType {
  id: string;
  project_name: string;
  client_name: string;
  address_line1?: string;
  project_status: string;
  project_type: string;
  project_owner_id?: string;
  [key: string]: any;
}

interface UserType {
  id: string;
  [key: string]: any;
}

export default function MyProjects() {
  const location = useLocation();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [updatesFilter, setUpdatesFilter] = useState("all");

  const isClient = user?.role === 'client';

  useEffect(() => {
    loadUserAndProjects();
    
    // Check if ?new=true is in the URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
      // Clean up the URL without the ?new=true parameter
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const loadUserAndProjects = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      let userProjects;
      
      // For clients, get projects where they are the client
      // For contractors/admins, get projects they own
      if (currentUser.role === 'client') {
        userProjects = await Project.filter({ client_id: currentUser.id });
      } else {
        userProjects = await Project.filter({ project_owner_id: currentUser.id });
      }
      
      setProjects(Array.isArray(userProjects) ? userProjects : []);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (projectData: any) => {
    try {
      if (!user) {
        console.error("User is not loaded");
        return;
      }
      
      // Extract only valid schema fields for projects table
      const {
        project_name,
        project_type,
        project_status,
        client_id,
        address_line1,
        address_line2,
        city,
        state,
        zip_code,
        estimated_subtotal,
        square_footage,
        estimated_start_date,
        actual_start_date,
        estimated_completion_date,
        actual_completion_date,
      } = projectData;

      const validProjectData = {
        project_name,
        project_type,
        project_status,
        client_id,
        address_line1,
        address_line2,
        city,
        state,
        zip_code,
        estimated_subtotal,
        square_footage,
        estimated_start_date,
        actual_start_date,
        estimated_completion_date,
        actual_completion_date,
      };
      
      const dataWithOwner = { 
        ...validProjectData, 
        project_owner_id: user.id 
      };
      
      if (editingProject) {
        await Project.update(editingProject.id, dataWithOwner);
      } else {
        await Project.create(dataWithOwner);
      }
      setShowForm(false);
      setEditingProject(null);
      loadUserAndProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project: ProjectType) => {
    // Clients cannot edit projects
    if (isClient) {
      setSelectedProject(project);
      return;
    }
    
    setEditingProject(project);
    setShowForm(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.address_line1 && project.address_line1.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || project.project_status === statusFilter;
    const matchesType = typeFilter === "all" || project.project_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Client View - Detailed Project View */}
      {isClient && selectedProject && (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedProject(null)}
          >
            ← Back to Projects
          </Button>
          <ClientProjectView project={selectedProject} />
        </div>
      )}

      {/* Client View - Project List */}
      {isClient && !selectedProject && (
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">View your project status and updates</p>
            </div>
          </div>

          <ProjectFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            updatesFilter={updatesFilter}
            setUpdatesFilter={setUpdatesFilter}
          />
          
          <ProjectGrid
            projects={filteredProjects}
            isLoading={isLoading}
            onEdit={handleEdit}
            viewOnly={true}
          />
        </>
      )}

      {/* Contractor/Admin View */}
      {!isClient && (
        <>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Manage your roofing projects and daily update activity</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2"
              disabled={showForm}
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>

          {showForm && (
            <ProjectForm
              project={editingProject}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
            />
          )}

          {!showForm && (
            <>
              <ProjectFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                updatesFilter={updatesFilter}
                setUpdatesFilter={setUpdatesFilter}
              />
              
              <ProjectGrid
                projects={filteredProjects}
                isLoading={isLoading}
                onEdit={handleEdit}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
