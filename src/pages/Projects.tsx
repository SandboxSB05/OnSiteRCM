import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Project } from "@/api/supabaseEntities";
import { DailyUpdate } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

import ProjectForm from "../components/projects/ProjectForm";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectFilters from "../components/projects/ProjectFilters";

interface ProjectType {
  id: string;
  project_name: string;
  client_name: string;
  address_line1?: string;
  project_status: string;
  project_type: string;
  [key: string]: any;
}

export default function Projects() {
  const location = useLocation();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [updatesFilter, setUpdatesFilter] = useState("all");

  useEffect(() => {
    loadProjects();
    
    // Check if ?new=true is in the URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
      // Clean up the URL without the ?new=true parameter
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await Project.list("-created_date");
      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (projectData: any) => {
    try {
      if (!user) {
        console.error("User not authenticated");
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

      if (editingProject) {
        await Project.update(editingProject.id, validProjectData);
      } else {
        // Add project_owner_id when creating new project
        const projectWithOwner = {
          ...validProjectData,
          project_owner_id: user.id
        };
        await Project.create(projectWithOwner);
      }
      setShowForm(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project: ProjectType) => {
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
          <p className="text-gray-600 mt-1">Manage all roofing projects with daily update activity</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
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
    </div>
  );
}