
import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { ProjectCollaborator } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import ProjectForm from "../components/projects/ProjectForm";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectGrid from "../components/projects/ProjectGrid";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [updatesFilter, setUpdatesFilter] = useState("all");

  useEffect(() => {
    loadUserAndProjects();
  }, []);

  const loadUserAndProjects = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Get projects owned by the user
      const ownedProjects = await Project.filter({ owner_user_id: currentUser.id });
      
      // Get projects where user is a collaborator
      const collaborationsResponse = await ProjectCollaborator.filter({ user_id: currentUser.id });
      const collaborations = Array.isArray(collaborationsResponse) ? collaborationsResponse : [];
      const collaboratedProjectIds = collaborations.map(c => c.project_id);
      
      const collaboratedProjects = collaboratedProjectIds.length > 0 
        ? await Promise.all(collaboratedProjectIds.map(id => Project.get(id)))
        : [];
      
      const allProjects = [...(ownedProjects || []), ...(collaboratedProjects.flat().filter(p => p) || [])];
      // Remove duplicates
      const uniqueProjects = allProjects.filter((project, index, arr) => 
        project && arr.findIndex(p => p.id === project.id) === index
      );
      
      setProjects(uniqueProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (projectData) => {
    try {
      const dataWithOwner = { ...projectData, owner_user_id: user.id };
      
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

  const handleEdit = (project) => {
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
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">Manage your roofing projects and daily update activity</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
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
