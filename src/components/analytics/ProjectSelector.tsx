import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectType {
  id: string;
  project_name: string;
}

interface ProjectSelectorProps {
  projects: ProjectType[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  isLoading: boolean;
}

export default function ProjectSelector({ projects, selectedProjectId, onSelectProject, isLoading }: ProjectSelectorProps) {
  return (
    <div className="w-full lg:w-72">
      <Select
        value={selectedProjectId || ""}
        onValueChange={onSelectProject}
        disabled={isLoading || projects.length === 0}
      >
        <SelectTrigger className="w-full bg-white shadow-sm">
          <SelectValue placeholder={isLoading ? "Loading projects..." : "Select a project"} />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p: ProjectType) => (
            <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}