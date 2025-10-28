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
      <div className="min-h-screen bg-white">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute right-[-10%] top-1/4 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
            <div className="absolute bottom-[-20%] right-0 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 pt-32 pb-20 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-8">
                <Badge className="w-fit rounded-full bg-emerald-100 px-4 py-1 text-emerald-700">
                  Contractor Dashboard
                </Badge>
                <h1 className="text-[3.5rem] font-bold leading-tight tracking-tight text-[#030213]">
                  Stay on top of every roof without leaving the job site
                </h1>
                <p className="text-[1.125rem] leading-relaxed text-[#717182]">
                  Your projects, updates, and customer touchpoints—all in one command center built
                  to keep crews efficient and clients impressed.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featureHighlights.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      </span>
                      <p className="text-sm text-[#030213]">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to={createPageUrl("DailyUpdates")}>
                    <Button className="h-12 px-6 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl hover:from-emerald-600 hover:to-teal-700">
                      Log Daily Update
                    </Button>
                  </Link>
                  <Link to={createPageUrl("MyProjects")}>
                    <Button
                      variant="outline"
                      className="h-12 px-6 text-base font-semibold border border-[rgba(3,2,19,0.12)] bg-white text-[#030213] hover:bg-[#ececf0]"
                    >
                      View My Projects
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]" />
                  <div className="relative space-y-8">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                        At a glance
                      </p>
                      <div className="mt-6 space-y-6">
                        {heroMetrics.map((metric) => (
                          <div
                            key={metric.label}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                          >
                            <span className="text-sm text-white/80">{metric.label}</span>
                            <span className="text-2xl font-semibold">
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        Latest update
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {latestUpdate
                          ? format(new Date(latestUpdate.update_date), "MMM d, yyyy")
                          : "No updates yet"}
                      </p>
                      {latestUpdateSummary ? (
                        <p className="mt-3 text-sm text-white/85 line-clamp-3">
                          {latestUpdateSummary}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-white/70">
                          Log your next update to keep your customers informed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <StatsOverview stats={stats} isLoading={isLoading} variant="contractor" />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
            <div className="space-y-12">
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
            <div className="space-y-8">
              <UpcomingTasks projects={projects} isLoading={isLoading} variant="contractor" />
              <div className="overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 text-white shadow-2xl">
                <div className="relative p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_55%)]" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                        Quick Actions
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold leading-tight">
                        Keep momentum across every job
                      </h3>
                      <p className="mt-2 text-sm text-white/80">
                        Shortcuts to the work you update most often.
                      </p>
                    </div>
                    <Badge className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90 backdrop-blur">
                      Recommended
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 bg-white/10 px-6 pb-6 pt-4 backdrop-blur">
                  {quickActions.map((action) => (
                    <Link key={action.title} to={action.to} className="block">
                      <div className="group flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white transition-all hover:border-white/40 hover:bg-white/15">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} text-white shadow-lg`}>
                            <action.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-white">
                              {action.title}
                            </p>
                            <p className="text-sm text-white/80">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
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
