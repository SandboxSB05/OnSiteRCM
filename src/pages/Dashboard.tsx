import React, { useState, useEffect } from "react";
import { Project } from "@/api/supabaseEntities";
import { DailyUpdate } from "@/api/supabaseEntities";
import { User } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FolderOpen, 
  Clock
} from "lucide-react";

import StatsOverview from "../components/dashboard/StatsOverview";

// Define types
interface ProjectType {
  id: string;
  project_status?: string;
  project_budget?: number;
  project_owner_id?: string;
  estimated_end_date?: string;
  estimated_completion_date?: string;
  [key: string]: any;
}

interface DailyUpdateType {
  update_date: string;
  project_id: string;
  [key: string]: any;
}

interface UserType {
  id: string;
  role: string;
  [key: string]: any;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdateType[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser: UserType = await User.me();
      setUser(currentUser);
      
      let projectsData: ProjectType[], updatesData: DailyUpdateType[];
      
      if (currentUser.role === 'admin') {
        // Admin sees all projects and updates
        [projectsData, updatesData] = await Promise.all([
          Project.list("-created_date", 20),
          DailyUpdate.list("-update_date", 10)
        ]);
      } else {
        // Contractor sees only their projects and updates
        console.log('Loading projects for contractor:', currentUser.id);
        projectsData = await Project.filter({ project_owner_id: currentUser.id });
        console.log('Contractor projects loaded:', projectsData.length);
        const projectIds = projectsData.map((p: ProjectType) => p.id);
        
        if (projectIds.length > 0) {
          const updatesArrays = await Promise.all(
            projectIds.map(id => DailyUpdate.filter({ project_id: id }))
          );
          updatesData = updatesArrays.flat().sort((a: DailyUpdateType, b: DailyUpdateType) => 
            new Date(b.update_date).getTime() - new Date(a.update_date).getTime()
          ).slice(0, 10);
        } else {
          updatesData = [];
        }
      }
      
      setProjects(projectsData);
      setDailyUpdates(updatesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter((p: ProjectType) => 
      p.project_status === 'in_progress' || p.project_status === 'planning'
    ).length;
    const completed = projects.filter((p: ProjectType) => p.project_status === 'completed').length;
    const onHold = projects.filter((p: ProjectType) => p.project_status === 'on_hold').length;
    const totalRevenue = projects.reduce((sum: number, p: ProjectType) => sum + (p.project_budget || 0), 0);
    
    // Calculate on-time completion rate
    // Completed projects are always on-time
    // Incomplete projects past due date are counted as late
    const today = new Date();
    const completedProjects = projects.filter((p: ProjectType) => p.project_status === 'completed').length;
    
    const lateProjects = projects.filter((p: ProjectType) => {
      // Skip if already completed (those are counted as on-time)
      if (p.project_status === 'completed') return false;
      // Check if project has a due date and it has passed
      if (!p.estimated_end_date && !p.estimated_completion_date) return false;
      const endDate = new Date(p.estimated_end_date || p.estimated_completion_date || '');
      return endDate < today;
    }).length;
    
    const totalRelevantProjects = completedProjects + lateProjects;
    const completionRate = totalRelevantProjects > 0 
      ? Math.round((completedProjects / totalRelevantProjects) * 100)
      : 0;
    
    return { total, active, completed, onHold, totalRevenue, completionRate };
  };

  const stats = getProjectStats();
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        {/* Compact Hero Header */}
        <section className="relative overflow-hidden bg-white border-b border-[rgba(0,0,0,0.06)]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-teal-50/30" />
          <div className="relative px-6 py-10 lg:px-12">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#030213]">
                Your Command Center
              </h1>
              <p className="text-lg leading-relaxed text-[#717182] mx-auto">
                Track projects, log updates, and keep clients informed—all from one place.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link to={createPageUrl("DailyUpdates")}>
                  <Button className="h-11 px-5 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all">
                    <Clock className="w-4 h-4 mr-2" />
                    Log Daily Update
                  </Button>
                </Link>
                <Link to={createPageUrl("MyProjects")}>
                  <Button
                    variant="outline"
                    className="h-11 px-5 text-base font-semibold border-2 border-[rgba(3,2,19,0.12)] bg-white text-[#030213] hover:bg-[#ececf0] hover:border-emerald-300 transition-all"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    View All Projects
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="px-6 py-8 lg:px-12">
          <StatsOverview stats={stats} isLoading={isLoading} variant="contractor" />
        </section>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin 
              ? "Overview of all projects and system activity." 
              : "Welcome back! Here's what's happening with your projects."
            }
          </p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("DailyUpdates")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Clock className="w-4 h-4 mr-2" />
              Add Daily Update
            </Button>
          </Link>
          <Link to={createPageUrl(isAdmin ? "Projects" : "MyProjects")}>
            <Button variant="outline">
              <FolderOpen className="w-4 h-4 mr-2" />
              {isAdmin ? 'All Projects' : 'My Projects'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview stats={stats} isLoading={isLoading} />
    </div>
  );
}
