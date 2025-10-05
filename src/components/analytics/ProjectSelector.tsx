import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProjectSelector({ projects, selectedProjectId, onSelectProject, isLoading }) {
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
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}