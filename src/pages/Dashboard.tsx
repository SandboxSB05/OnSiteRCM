import React, { useState, useEffect } from "react";
import { Project } from "@/api/supabaseEntities";
import { DailyUpdate } from "@/api/supabaseEntities";
import { User } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FolderOpen, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentProjects from "../components/dashboard/RecentProjects";
import RecentUpdates from "../components/dashboard/RecentUpdates";
import UpcomingTasks from "../components/dashboard/UpcomingTasks";

// Define types
interface ProjectType {
  id: string;
  project_status?: string;
  project_budget?: number;
  owner_user_id: string;
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
        // Regular user sees only their projects and updates
        projectsData = await Project.filter({ owner_user_id: currentUser.id });
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
    const active = projects.filter((p: ProjectType) => p.project_status === 'in_progress').length;
    const completed = projects.filter((p: ProjectType) => p.project_status === 'completed').length;
    const onHold = projects.filter((p: ProjectType) => p.project_status === 'on_hold').length;
    const totalRevenue = projects.reduce((sum: number, p: ProjectType) => sum + (p.project_budget || 0), 0);
    
    return { total, active, completed, onHold, totalRevenue };
  };

  const stats = getProjectStats();
  const isAdmin = user?.role === 'admin';
  const latestUpdate = dailyUpdates[0];
  const latestUpdateSummary = latestUpdate?.ai_summary || latestUpdate?.pm_description;

  if (!isAdmin) {
    const heroMetrics = [
      {
        label: "Active Projects",
        value: isLoading ? "—" : stats.active,
      },
      {
        label: "Completed Projects",
        value: isLoading ? "—" : stats.completed,
      },
      {
        label: "Revenue Tracked",
        value: isLoading ? "—" : `$${stats.totalRevenue.toLocaleString()}`,
      },
    ];

    const featureHighlights = [
      "AI-ready daily updates keep clients in the loop automatically.",
      "Live project health snapshots help you prioritize the right jobs.",
      "Photo logs and task reminders keep crews aligned in the field.",
    ];

    const quickActions = [
      {
        title: "Log Daily Update",
        description: "Capture progress with notes, photos, and AI summaries.",
        icon: Clock,
        to: createPageUrl("DailyUpdates"),
        accent: "from-emerald-500 to-teal-600",
      },
      {
        title: "Review My Projects",
        description: "Check budgets, milestones, and customer visibility.",
        icon: FolderOpen,
        to: createPageUrl("MyProjects"),
        accent: "from-teal-500 to-cyan-600",
      },
      {
        title: "Share Customer Portal",
        description: "Invite homeowners to follow progress in real-time.",
        icon: Users,
        to: createPageUrl("CustomerPortal"),
        accent: "from-blue-500 to-indigo-600",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
        {/* Compact Hero Header */}
        <section className="relative overflow-hidden bg-white border-b border-[rgba(0,0,0,0.06)]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-teal-50/30" />
          <div className="relative px-6 py-10 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left: Title & Description */}
              <div className="space-y-4 flex-1">
                <Badge className="w-fit rounded-full bg-emerald-100 px-4 py-1.5 text-emerald-700 font-medium">
                  Contractor Dashboard
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#030213]">
                  Your Command Center
                </h1>
                <p className="text-lg leading-relaxed text-[#717182] max-w-2xl">
                  Track projects, log updates, and keep clients informed—all from one place.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
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

              {/* Right: Compact Metrics Card */}
              <div className="lg:w-[360px] xl:w-[400px]">
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_50%)]" />
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">
                        At a Glance
                      </p>
                      {latestUpdate && (
                        <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Updated {format(new Date(latestUpdate.update_date), "MMM d")}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {heroMetrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-sm"
                        >
                          <div className="text-xs text-white/70 mb-1">{metric.label}</div>
                          <div className="text-xl font-bold">
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="px-6 py-8 lg:px-12">
          <StatsOverview stats={stats} isLoading={isLoading} variant="contractor" />
        </section>

        {/* Main Content Grid */}
        <section className="px-6 pb-12 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - 2/3 width - Projects & Updates */}
            <div className="lg:col-span-2 space-y-6">
              <RecentProjects
                projects={projects}
                isLoading={isLoading}
                variant="contractor"
                projectsPage="MyProjects"
              />
              <RecentUpdates
                dailyUpdates={dailyUpdates}
                projects={projects}
                isLoading={isLoading}
                variant="contractor"
              />
            </div>

            {/* Right Column - 1/3 width - Tasks & Quick Actions */}
            <div className="space-y-6">
              <UpcomingTasks projects={projects} isLoading={isLoading} variant="contractor" />
              
              {/* Quick Actions Card */}
              <div className="overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 text-white shadow-xl">
                <div className="relative p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/80 font-semibold mb-2">
                          Quick Actions
                        </p>
                        <h3 className="text-xl font-semibold leading-tight">
                          Keep momentum going
                        </h3>
                      </div>
                      <Badge className="rounded-full bg-white/20 px-3 py-1 text-xs text-white border-0 backdrop-blur shrink-0">
                        Popular
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 bg-white/10 px-4 pb-4 pt-3 backdrop-blur">
                  {quickActions.map((action) => (
                    <Link key={action.title} to={action.to} className="block">
                      <div className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white transition-all hover:border-white/40 hover:bg-white/20 hover:scale-[1.02]">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.accent} text-white shadow-md`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {action.title}
                          </p>
                          <p className="text-xs text-white/75 line-clamp-1">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
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

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentProjects 
            projects={projects} 
            isLoading={isLoading}
          />
          <RecentUpdates 
            dailyUpdates={dailyUpdates} 
            projects={projects} 
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-6">
          <UpcomingTasks projects={projects} isLoading={isLoading} />
          
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`${createPageUrl(isAdmin ? "Projects" : "MyProjects")}?new=true`} className="block">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">New Project</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              
              {isAdmin && (
                <>
                  <Link to={createPageUrl("Analytics")} className="block">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium">View Analytics</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                  
                  <Link to={createPageUrl("Users")} className="block">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">Manage Users</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                </>
              )}
              
              <Link to={createPageUrl("CustomerPortal")} className="block">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Customer Portal</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
